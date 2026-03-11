import { Types } from 'mongoose'
import Cart from '../models/Cart'
import { ICartItem, ICart } from '../types'
import Product from '../models/Product'
import { AppError } from '../types'
import { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator'

export const getCart = async (userId: string): Promise<ICart> => {
  let cart = await Cart.findOne({ userId }).populate(
    'items.productId',
    'name price serviceFee imageUrls variants isAvailableForOrder status seller totalSold originCity'
  )

  if (!cart) {
    cart = await Cart.create({ userId })
    cart = await cart.populate(
      'items.productId',
      'name price serviceFee imageUrls variants isAvailableForOrder status seller totalSold originCity'
    )
  }

  return cart
}

export const addToCart = async (userId: string, input: AddToCartInput) => {
  const product = await Product.findById(input.productId)
  if (!product) {
    throw new AppError(404, 'Product not found.')
  }
  if (!product.isAvailableForOrder || product.status !== 'available') {
    throw new AppError(400, 'Product is currently unavailable for order.')
  }

  if (input.variantName) {
    const variantExists = product.variants.some((v) => v.name === input.variantName)
    if (!variantExists) {
      throw new AppError(400, 'Selected variant does not exist.')
    }
  }

  let cart = await Cart.findOne({ userId })
  if (!cart) {
    cart = new Cart({ userId, items: [] })
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === input.productId && item.variantName === input.variantName
  )

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += input.quantity
  } else {
    cart.items.push({
      productId: new Types.ObjectId(input.productId),
      quantity: input.quantity,
      variantName: input.variantName,
      addedAt: new Date(),
    })
  }

  await cart.save()
  return getCart(userId)
}

export const updateCartItemQuantity = async (userId: string, itemId: string, input: UpdateCartItemInput) => {
  const cart = await Cart.findOne({ userId })
  if (!cart) throw new AppError(404, 'Cart not found.')

  const item = cart.items.id(itemId)
  if (!item) throw new AppError(404, 'Cart item not found.')

  item.quantity = input.quantity
  await cart.save()

  return getCart(userId)
}

export const removeFromCart = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ userId })
  if (!cart) throw new AppError(404, 'Cart not found.')

  const itemIndex = cart.items.findIndex((i) => i._id?.toString() === itemId)
  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1)
    await cart.save()
  }

  return getCart(userId)
}

export const clearCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId })
  if (cart) {
    cart.items.splice(0, cart.items.length)
    await cart.save()
  }
  return getCart(userId)
}
