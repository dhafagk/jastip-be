import Seller from '../models/Seller'
import User from '../models/User'
import Order from '../models/Order'
import { IAddress } from '../types'
import { AppError } from '../types'
import { AddressInput, PartialAddressInput } from '../validators/address.validator'
import {
  CreateSellerInput,
  UpdateSellerInput,
  ListSellersQuery,
  AddSellerReviewInput,
} from '../validators/seller.validator'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export const listSellers = async (query: ListSellersQuery) => {
  const filter: Record<string, unknown> = {}

  if (query.city) {
    filter['currentCity'] = { $regex: query.city, $options: 'i' }
  }
  if (query.isVerified !== undefined) {
    filter['isVerified'] = query.isVerified === 'true'
  }
  if (query.minRating !== undefined) {
    filter['rating'] = { $gte: parseFloat(query.minRating) }
  }
  if (query.country) {
    filter['frequentCountries'] = { $regex: query.country, $options: 'i' }
  }
  if (query.niche) {
    filter['productNiches'] = { $regex: query.niche, $options: 'i' }
  }

  const page = parseInt(query.page ?? '1', 10)
  const limit = Math.min(MAX_LIMIT, parseInt(query.limit ?? String(DEFAULT_LIMIT), 10))
  const skip = (page - 1) * limit

  const [sellers, total] = await Promise.all([
    Seller.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Seller.countDocuments(filter),
  ])

  return { sellers, total, page, limit }
}

export const getSellerById = async (id: string) => {
  const seller = await Seller.findById(id)
  if (!seller) throw new AppError(404, 'Seller not found.')
  return seller
}

export const createSeller = async (input: CreateSellerInput) => {
  return Seller.create(input)
}

export const updateSeller = async (id: string, input: UpdateSellerInput) => {
  const seller = await Seller.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
  if (!seller) throw new AppError(404, 'Seller not found.')
  return seller
}

export const deleteSeller = async (id: string) => {
  const seller = await Seller.findByIdAndDelete(id)
  if (!seller) throw new AppError(404, 'Seller not found.')
}

// --- Address Management ---

export const addAddress = async (sellerId: string, input: AddressInput) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  const isFirstAddress = seller.addresses.length === 0
  const shouldBeDefault = input.isDefault || isFirstAddress

  if (shouldBeDefault && !isFirstAddress) {
    seller.addresses.forEach((addr) => {
      addr.isDefault = false
    })
  }

  seller.addresses.push({ ...input, isDefault: shouldBeDefault } as IAddress)
  await seller.save()
  return seller
}

export const updateAddress = async (sellerId: string, addressId: string, input: PartialAddressInput) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  const address = seller.addresses.id(addressId)
  if (!address) throw new AppError(404, 'Address not found.')

  if (input.isDefault && !address.isDefault) {
    seller.addresses.forEach((addr) => {
      addr.isDefault = false
    })
  } else if (input.isDefault === false && address.isDefault) {
    if (seller.addresses.length > 1) {
      throw new AppError(400, 'Cannot unset the only default address. Set another address as default instead.')
    }
  }

  address.set(input)
  await seller.save()
  return seller
}

export const removeAddress = async (sellerId: string, addressId: string) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  const addressIndex = seller.addresses.findIndex((addr) => String(addr._id) === addressId)
  if (addressIndex === -1) throw new AppError(404, 'Address not found.')

  const wasDefault = seller.addresses[addressIndex].isDefault
  seller.addresses.splice(addressIndex, 1)

  if (wasDefault && seller.addresses.length > 0) {
    seller.addresses[0].isDefault = true
  }

  await seller.save()
  return seller
}

export const setDefaultAddress = async (sellerId: string, addressId: string) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  const address = seller.addresses.id(addressId)
  if (!address) throw new AppError(404, 'Address not found.')

  seller.addresses.forEach((addr) => {
    addr.isDefault = false
  })
  address.isDefault = true

  await seller.save()
  return seller
}

// --- Reviews ---

export const addReview = async (sellerId: string, input: AddSellerReviewInput, userId: string) => {
  const [seller, user, order] = await Promise.all([
    Seller.findById(sellerId),
    User.findById(userId).select('name avatarUrl'),
    Order.findOne({ userId, sellerId, status: 'delivered' }), // Strict Escrow Trust Rule
  ])

  if (!seller) throw new AppError(404, 'Seller not found.')
  if (!user) throw new AppError(404, 'User not found.')

  if (!order) {
    throw new AppError(403, 'You can only review a seller after successfully completing an order with them.')
  }

  const alreadyReviewed = seller.reviews.some((r) => r.userId.toString() === userId)
  if (alreadyReviewed) {
    throw new AppError(409, 'You have already reviewed this seller.')
  }

  const review = {
    userId: user._id,
    userName: user.name,
    userAvatarUrl: user.avatarUrl ?? '',
    rating: input.rating,
    comment: input.comment,
    imageUrls: input.imageUrls,
    createdAt: new Date(),
  }

  seller.reviews.push(review)

  // Re-calculate the average dynamic rating
  const totalRating = seller.reviews.reduce((acc, curr) => acc + curr.rating, 0)
  seller.rating = Math.round((totalRating / seller.reviews.length) * 10) / 10

  await seller.save()
  return seller
}

// --- Verification ---

export const requestVerification = async (sellerId: string) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  if (seller.isVerified) {
    throw new AppError(400, 'Seller is already verified.')
  }

  if (seller.verificationStatus === 'pending') {
    throw new AppError(400, 'Verification request is already pending.')
  }

  // Enforce MVP Rule: Must have completely fulfilled at least 2 Jastip Orders!
  const completedOrdersCount = await Order.countDocuments({ sellerId, status: 'delivered' })

  if (completedOrdersCount < 2) {
    throw new AppError(
      403,
      `You must successfully fulfill at least 2 orders before requesting verification. Currently fulfilled: ${completedOrdersCount}`
    )
  }

  seller.verificationStatus = 'pending'
  seller.verificationRequestDate = new Date()
  await seller.save()

  return seller
}

export const approveVerification = async (sellerId: string) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  if (seller.verificationStatus !== 'pending') {
    throw new AppError(400, 'Seller must have a pending verification request to be approved.')
  }

  seller.verificationStatus = 'verified'
  seller.isVerified = true
  await seller.save()

  return seller
}

export const rejectVerification = async (sellerId: string) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  if (seller.verificationStatus !== 'pending') {
    throw new AppError(400, 'Seller must have a pending verification request to be rejected.')
  }

  seller.verificationStatus = 'rejected'
  seller.isVerified = false
  await seller.save()

  return seller
}
