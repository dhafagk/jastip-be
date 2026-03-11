import { Types } from 'mongoose'
import CustomRequest from '../models/CustomRequest'
import Seller from '../models/Seller'
import User from '../models/User'
import { AppError } from '../types'
import {
  CreateCustomRequestInput,
  SubmitBidInput,
  ListCustomRequestsQuery,
} from '../validators/customRequest.validator'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export const createCustomRequest = async (userId: string, input: CreateCustomRequestInput) => {
  if (input.targetSellerId) {
    const seller = await Seller.findById(input.targetSellerId)
    if (!seller) throw new AppError(404, 'Targeted seller not found.')
  }

  const request = await CustomRequest.create({
    userId,
    ...input,
    status: 'open',
    bids: [],
  })

  return request
}

export const listCustomRequests = async (query: ListCustomRequestsQuery) => {
  const filter: Record<string, unknown> = {}

  if (query.targetSupplierId) {
    // Buyers querying their specific sent requests, or Sellers seeing requests aimed at them
    filter['targetSellerId'] = query.targetSupplierId
  }
  if (query.targetCountry) {
    filter['targetCountry'] = { $regex: query.targetCountry, $options: 'i' }
  }
  if (query.category) {
    filter['category'] = { $regex: query.category, $options: 'i' }
  }
  if (query.status) {
    filter['status'] = query.status
  }

  const page = parseInt(query.page ?? '1', 10)
  const limit = Math.min(MAX_LIMIT, parseInt(query.limit ?? String(DEFAULT_LIMIT), 10))
  const skip = (page - 1) * limit

  const [requests, total] = await Promise.all([
    CustomRequest.find(filter)
      .populate('userId', 'name avatarUrl')
      .populate('targetSellerId', 'name avatarUrl')
      .populate('bids.sellerId', 'name avatarUrl rating')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    CustomRequest.countDocuments(filter),
  ])

  return { requests, total, page, limit }
}

export const getCustomRequestById = async (id: string) => {
  const request = await CustomRequest.findById(id)
    .populate('userId', 'name avatarUrl')
    .populate('targetSellerId', 'name avatarUrl')
    .populate('bids.sellerId', 'name avatarUrl rating')

  if (!request) throw new AppError(404, 'Custom request not found.')
  return request
}

export const submitBid = async (requestId: string, sellerId: string, input: SubmitBidInput) => {
  const request = await CustomRequest.findById(requestId)
  if (!request) throw new AppError(404, 'Custom request not found.')
  if (request.status !== 'open' && request.status !== 'quoted') {
    throw new AppError(400, 'Cannot bid on a request that is no longer open.')
  }

  // If this was a targeted request, explicitly ensure ONLY the target seller can bid.
  if (request.targetSellerId && request.targetSellerId.toString() !== sellerId) {
    throw new AppError(403, 'This request was targeted to a specific seller and is not open for global bids.')
  }

  // Check if seller already bid
  const existingBidIndex = request.bids.findIndex((b) => b.sellerId.toString() === sellerId)

  if (existingBidIndex >= 0) {
    // Update existing bid
    request.bids[existingBidIndex].price = input.price
    request.bids[existingBidIndex].serviceFee = input.serviceFee
    request.bids[existingBidIndex].estimatedDeliveryDate = new Date(input.estimatedDeliveryDate)
    if (input.notes) request.bids[existingBidIndex].notes = input.notes
  } else {
    // Add new bid
    request.bids.push({
      sellerId: new Types.ObjectId(sellerId),
      price: input.price,
      serviceFee: input.serviceFee,
      estimatedDeliveryDate: new Date(input.estimatedDeliveryDate),
      notes: input.notes,
      status: 'pending',
      createdAt: new Date(),
    })
  }

  request.status = 'quoted'
  await request.save()

  // Populate seller info so the response is rich
  await request.populate('bids.sellerId', 'name avatarUrl rating')

  return request
}

export const acceptBid = async (requestId: string, bidId: string, userId: string, addressId: string) => {
  // 1. Validate Buyer and Address
  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found.')

  const address = user.addresses.id(addressId)
  if (!address) throw new AppError(404, 'Shipping address not found in user profile.')

  // 2. Validate Request
  const request = await CustomRequest.findById(requestId)
  if (!request) throw new AppError(404, 'Custom request not found.')
  if (request.userId.toString() !== userId) throw new AppError(403, 'You do not own this request.')
  if (request.status !== 'open' && request.status !== 'quoted') {
    throw new AppError(400, 'This request is already resolved or cancelled.')
  }

  // 3. Find and Accept the Bid
  const bid = request.bids.id(bidId)
  if (!bid) throw new AppError(404, 'Bid not found.')

  // Reject all other bids, accept the target
  request.bids.forEach((b) => {
    b.status = b._id.toString() === bidId ? 'accepted' : 'rejected'
  })

  // Lock Request
  request.status = 'accepted'
  await request.save()

  // The caller will now traditionally take this `request` payload, and bridge it to generate an Order.
  // We return the locked request and address so the controller can chain them into the Order Service.
  return { request, bid, userAddress: address }
}
