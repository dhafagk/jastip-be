import { Types } from 'mongoose'
import Order from '../models/Order'
import Product from '../models/Product'
import Cart from '../models/Cart'
import User from '../models/User'
import { AppError } from '../types'
import { CheckoutCartInput, CheckoutDirectInput } from '../validators/order.validator'

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
  if (product.quantity < input.quantity) {
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
  product.quantity -= input.quantity
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
    grandTotal: totalProductPrice + totalServiceFee,
    shippingAddress: address,
    notes: input.notes,
    status: 'pending',
  })

  return order
}

export const checkoutFromCart = async (userId: string, input: CheckoutCartInput) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found.')

  const address = user.addresses.id(input.shippingAddressId)
  if (!address) throw new AppError(404, 'Shipping address not found in user profile.')

  const cart = await Cart.findOne({ userId }).populate('items.productId')
  if (!cart || cart.items.length === 0) {
    throw new AppError(400, 'Cart is empty.')
  }

  // Filter items if specific IDs provided
  let itemsToCheckout = cart.items
  if (input.cartItemIds && input.cartItemIds.length > 0) {
    itemsToCheckout = cart.items.filter((item) =>
      input.cartItemIds!.includes(item._id!.toString())
    ) as Types.DocumentArray<any>
    if (itemsToCheckout.length === 0) {
      throw new AppError(400, 'None of the requested items were found in the cart.')
    }
  }

  // Validate stock
  const cartItemsWithProducts = itemsToCheckout.filter((item) => item.productId != null)

  // Group by Seller ID
  const sellerGroups: Record<string, any[]> = {}

  for (const item of cartItemsWithProducts) {
    const product = item.productId as any // Populated

    if (product.status !== 'available' || !product.isAvailableForOrder) {
      throw new AppError(400, `Product ${product.name} is not available for order.`)
    }

    // We only have the snapshot of product. We must lock/double-check it, but standard findById is safer for stock.
  }

  // Actually, we should fetch products cleanly to avoid race conditions and modify stock.
  const productIds = cartItemsWithProducts.map((i) => i.productId._id)
  const products = await Product.find({ _id: { $in: productIds } })
  const productMap = new Map(products.map((p) => [p._id.toString(), p]))

  // Group items by seller and check stock
  for (const item of cartItemsWithProducts) {
    const product = productMap.get(item.productId._id.toString())
    if (!product) throw new AppError(404, 'Cart contains a product that no longer exists.')

    if (product.quantity < item.quantity) {
      throw new AppError(400, `Insufficient stock for product ${product.name}.`)
    }

    let price = product.price
    if (item.variantName) {
      const variant = product.variants.find((v) => v.name === item.variantName)
      if (!variant) throw new AppError(400, `Variant ${item.variantName} not found for ${product.name}.`)
      if (variant.stock < item.quantity) {
        throw new AppError(400, `Insufficient stock for variant ${variant.name}.`)
      }
      price += variant.extraPrice
    }

    const sellerId = product.seller.toString()
    if (!sellerGroups[sellerId]) sellerGroups[sellerId] = []

    sellerGroups[sellerId].push({
      item,
      product,
      price,
      serviceFee: product.serviceFee,
    })
  }

  const createdOrders = []

  // Create Orders and Decrease Stock
  for (const [sellerId, itemsData] of Object.entries(sellerGroups)) {
    let totalProductPrice = 0
    let totalServiceFee = 0
    const orderItems = []

    for (const data of itemsData) {
      const product = data.product

      // Decrease stock
      product.quantity -= data.item.quantity
      if (data.item.variantName) {
        const variantIndex = product.variants.findIndex((v: any) => v.name === data.item.variantName)
        product.variants[variantIndex].stock -= data.item.quantity
      }
      await product.save()

      const pTotal = data.price * data.item.quantity
      const sTotal = data.serviceFee * data.item.quantity

      totalProductPrice += pTotal
      totalServiceFee += sTotal

      orderItems.push({
        productId: product._id,
        quantity: data.item.quantity,
        variantName: data.item.variantName,
        price: data.price,
        serviceFee: data.serviceFee,
      })
    }

    const order = await Order.create({
      userId,
      sellerId,
      items: orderItems,
      totalProductPrice,
      totalServiceFee,
      grandTotal: totalProductPrice + totalServiceFee,
      shippingAddress: address,
      notes: input.notes,
      status: 'pending',
    })

    createdOrders.push(order)
  }

  // Remove checked out items from cart
  const checkedOutItemIds = cartItemsWithProducts.map((i) => i._id!.toString())
  cart.items = cart.items.filter(
    (item) => !checkedOutItemIds.includes(item._id!.toString())
  ) as Types.DocumentArray<any>
  await cart.save()

  return createdOrders
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
  trackingNumber?: string
) => {
  const order = await Order.findOne({ _id: orderId, sellerId })
  if (!order) throw new AppError(404, 'Order not found for this seller.')

  order.status = status as any
  if (courier) order.courier = courier
  if (trackingNumber) order.trackingNumber = trackingNumber

  await order.save()
  return order
}

export const processPayment = async (orderId: string, userId: string) => {
  const order = await Order.findOne({ _id: orderId, userId })
  if (!order) throw new AppError(404, 'Order not found.')

  if (order.status !== 'pending') {
    throw new AppError(400, 'Only pending orders can be paid for.')
  }

  order.status = 'processing'
  await order.save()
  return order
}
