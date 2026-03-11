import { Types } from 'mongoose'
import Product from '../models/Product'
import User from '../models/User'
import { AppError } from '../types'
import {
  CreateProductInput,
  UpdateProductInput,
  AddReviewInput,
  ListProductsQuery,
} from '../validators/product.validator'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export const listProducts = async (query: ListProductsQuery) => {
  const filter: Record<string, unknown> = {}

  if (query.category) {
    filter['category'] = { $regex: query.category, $options: 'i' }
  }
  if (query.status) {
    filter['status'] = query.status
  }
  if (query.sellerId) {
    filter['seller'] = query.sellerId
  }
  if (query.originCity) {
    filter['originCity'] = { $regex: query.originCity, $options: 'i' }
  }
  if (query.tag) {
    filter['tags'] = query.tag
  }
  if (query.isAvailableForOrder !== undefined) {
    filter['isAvailableForOrder'] = query.isAvailableForOrder === 'true'
  }

  const priceFilter: Record<string, number> = {}
  if (query.minPrice !== undefined) {
    priceFilter['$gte'] = parseFloat(query.minPrice)
  }
  if (query.maxPrice !== undefined) {
    priceFilter['$lte'] = parseFloat(query.maxPrice)
  }
  if (Object.keys(priceFilter).length > 0) {
    filter['price'] = priceFilter
  }

  const page = parseInt(query.page ?? '1', 10)
  const limit = Math.min(MAX_LIMIT, parseInt(query.limit ?? String(DEFAULT_LIMIT), 10))
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name avatarUrl currentCity rating isVerified')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ])

  return { products, total, page, limit }
}

export const getProductById = async (id: string) => {
  const product = await Product.findById(id).populate('seller', 'name avatarUrl currentCity rating isVerified')
  if (!product) throw new AppError(404, 'Product not found.')
  return product
}

export const createProduct = async (input: CreateProductInput, sellerId: string) => {
  return Product.create({ ...input, seller: sellerId })
}

export const updateProduct = async (
  id: string,
  input: UpdateProductInput,
  requesterId: string,
  requesterRole: string
) => {
  const product = await Product.findById(id)
  if (!product) throw new AppError(404, 'Product not found.')

  if (requesterRole !== 'admin' && product.seller.toString() !== requesterId) {
    throw new AppError(403, 'Forbidden. You can only modify your own products.')
  }

  const updated = await Product.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).populate('seller', 'name avatarUrl currentCity rating isVerified')

  return updated
}

export const deleteProduct = async (id: string, requesterId: string, requesterRole: string) => {
  const product = await Product.findById(id)
  if (!product) throw new AppError(404, 'Product not found.')

  if (requesterRole !== 'admin' && product.seller.toString() !== requesterId) {
    throw new AppError(403, 'Forbidden. You can only delete your own products.')
  }

  await Product.findByIdAndDelete(id)
}

export const addReview = async (productId: string, input: AddReviewInput, userId: string) => {
  const [product, user] = await Promise.all([Product.findById(productId), User.findById(userId).select('name')])

  if (!product) throw new AppError(404, 'Product not found.')
  if (!user) throw new AppError(404, 'User not found.')

  const alreadyReviewed = product.reviews.some((r) => r.userId.toString() === userId)
  if (alreadyReviewed) {
    throw new AppError(409, 'You have already reviewed this product.')
  }

  const review = {
    userId: new Types.ObjectId(userId),
    userName: user.name,
    userAvatarUrl: input.userAvatarUrl ?? '',
    rating: input.rating,
    comment: input.comment,
    imageUrls: input.imageUrls,
    createdAt: new Date(),
  }

  const updated = await Product.findByIdAndUpdate(
    productId,
    { $push: { reviews: review } },
    { new: true, runValidators: true }
  ).populate('seller', 'name avatarUrl currentCity rating isVerified')

  return updated
}
