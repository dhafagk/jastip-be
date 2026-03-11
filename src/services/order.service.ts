import { Types } from 'mongoose'
import Order from '../models/Order'
import Product from '../models/Product'
import User from '../models/User'
import Seller from '../models/Seller'
import WalletTransaction from '../models/WalletTransaction'
import { AppError } from '../types'
import { CheckoutDirectInput } from '../validators/order.validator'

export const checkoutDirect = async (userId: string, input: CheckoutDirectInput) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found.')

  const address = user.addresses.id(input.shippingAddressId)
  if (!address) throw new AppError(404, 'Shipping address not found in user profile.')

  const product = await Product.findById(input.productId)
  if (!product) throw new AppError(404, 'Product not found.')

  if (product.status !== 'available' || !product.isAvailableForOrder) {
    throw new AppError(400, 'Product is not available for order.')
  }

  // Stock check
  if (!product.isUnlimitedQuota && product.quantity < input.quantity) {
    throw new AppError(400, `Insufficient stock for product ${product.name}.`)
  }

  if (input.variantName) {
    const variant = product.variants.find((v) => v.name === input.variantName)
    if (!variant) throw new AppError(400, 'Variant not found.')
    if (variant.stock < input.quantity) {
      throw new AppError(400, `Insufficient stock for variant ${variant.name}.`)
    }
  }

  // Reserve stock
  if (!product.isUnlimitedQuota) {
    product.quantity -= input.quantity
  }
  if (input.variantName) {
    const variantIndex = product.variants.findIndex((v) => v.name === input.variantName)
    product.variants[variantIndex].stock -= input.quantity
  }
  await product.save()

  // Calculate totals
  const price =
    product.price + (input.variantName ? product.variants.find((v) => v.name === input.variantName)!.extraPrice : 0)
  const totalProductPrice = price * input.quantity
  const totalServiceFee = product.serviceFee * input.quantity
  const grandTotal = totalProductPrice + totalServiceFee

  // MVP Standard: 50% Down Payment to lock the PO
  const depositAmount = grandTotal * 0.5
  const remainingBalance = grandTotal - depositAmount

  // Create Order
  const order = await Order.create({
    userId,
    sellerId: product.seller,
    items: [
      {
        productId: product._id,
        quantity: input.quantity,
        variantName: input.variantName,
        price,
        serviceFee: product.serviceFee,
      },
    ],
    totalProductPrice,
    totalServiceFee,
    grandTotal,
    depositAmount,
    remainingBalance,
    paymentStatus: 'unpaid',
    shippingAddress: address,
    notes: input.notes,
    status: 'pending',
  })

  return order
}

export const getUserOrders = async (userId: string) => {
  return Order.find({ userId }).populate('items.productId', 'name imageUrls').sort({ createdAt: -1 })
}

export const getSellerOrders = async (sellerId: string) => {
  return Order.find({ sellerId })
    .populate('items.productId', 'name imageUrls')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
}

export const updateOrderStatus = async (
  orderId: string,
  sellerId: string,
  status: string,
  courier?: string,
  trackingNumber?: string,
  proofImageUrl?: string
) => {
  const order = await Order.findOne({ _id: orderId, sellerId })
  if (!order) throw new AppError(404, 'Order not found for this seller.')

  order.status = status as any
  if (courier) order.courier = courier
  if (trackingNumber) order.trackingNumber = trackingNumber
  if (proofImageUrl) order.imageProofs.push(proofImageUrl)

  await order.save()
  return order
}

export const processPayment = async (orderId: string, userId: string) => {
  const order = await Order.findOne({ _id: orderId, userId })
  if (!order) throw new AppError(404, 'Order not found.')

  if (order.status === 'cancelled') {
    throw new AppError(400, 'Cannot pay for a cancelled order.')
  }

  // State 1: Paying the initial Deposit (DP)
  if (order.paymentStatus === 'unpaid') {
    order.paymentStatus = 'deposit_paid'
    order.status = 'processing' // Officially locked for the seller to source
    await order.save()

    // ESCROW: Instantly release DP to Verified Sellers so they can buy the item overseas
    const seller = await Seller.findById(order.sellerId)
    if (seller && seller.isVerified) {
      seller.balance += order.depositAmount
      await seller.save()

      await WalletTransaction.create({
        sellerId: seller._id,
        orderId: order._id,
        type: 'earning',
        amount: order.depositAmount,
        status: 'completed',
        notes: 'Verified Seller: Instant Deposit (DP) Release',
      })
    }

    return order
  }

  // State 2: Paying the remaining balance (usually when arrived_locally)
  if (order.paymentStatus === 'deposit_paid') {
    if (order.status !== 'arrived_locally') {
      throw new AppError(400, 'Remaining balance is typically paid when the item has arrived locally.')
    }
    order.paymentStatus = 'fully_paid'
    order.remainingBalance = 0
    await order.save()
    return order
  }

  throw new AppError(400, 'Order is already fully paid.')
}

export const cancelOrder = async (orderId: string, userId: string) => {
  const order = await Order.findOne({ _id: orderId, userId })
  if (!order) throw new AppError(404, 'Order not found.')

  if (order.status !== 'pending') {
    throw new AppError(400, 'Only pending orders can be cancelled.')
  }

  // Restore inventory
  for (const item of order.items) {
    const product = await Product.findById(item.productId)
    if (product) {
      if (!product.isUnlimitedQuota) {
        product.quantity += item.quantity
      }
      if (item.variantName) {
        const variantIndex = product.variants.findIndex((v: any) => v.name === item.variantName)
        if (variantIndex > -1) {
          product.variants[variantIndex].stock += item.quantity
        }
      }
      await product.save()
    }
  }

  order.status = 'cancelled'
  await order.save()
  return order
}

export const completeOrder = async (orderId: string, userId: string) => {
  const order = await Order.findOne({ _id: orderId, userId })
  if (!order) throw new AppError(404, 'Order not found.')

  if (order.status !== 'shipped') {
    throw new AppError(400, 'Only shipped orders can be marked as delivered/completed.')
  }

  // Update order status
  order.status = 'delivered'
  await order.save()

  // Reward the seller
  const seller = await Seller.findById(order.sellerId)
  if (!seller) throw new AppError(404, 'Seller not found during order completion.')

  // ESCROW: If verified, they already got the DP. We only release the remaining balance.
  // If unverified, they get the full grand total now.
  const earningAmount = seller.isVerified ? order.remainingBalance : order.grandTotal

  if (earningAmount > 0) {
    seller.balance += earningAmount
    await seller.save()

    // Record the earning
    await WalletTransaction.create({
      sellerId: seller._id,
      orderId: order._id,
      type: 'earning',
      amount: earningAmount,
      status: 'completed',
      notes: seller.isVerified ? 'Verified Seller: Final Balance Release' : 'Unverified Seller: Full Escrow Release',
    })
  }

  return order
}
