import { Response, NextFunction } from 'express'
import * as customReqService from '../services/customRequest.service'
import { AuthRequest, ApiResponse, AppError } from '../types'
import {
  CreateCustomRequestInput,
  SubmitBidInput,
  AcceptBidInput,
  ListCustomRequestsQuery,
} from '../validators/customRequest.validator'
import Order from '../models/Order'

export const create = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')

    const request = await customReqService.createCustomRequest(req.user.id, req.body as CreateCustomRequestInput)
    res.status(201).json({ success: true, message: 'Custom request published.', data: { request } })
  } catch (err) {
    next(err)
  }
}

export const list = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const data = await customReqService.listCustomRequests(req.query as ListCustomRequestsQuery)
    res.json({ success: true, message: 'Custom requests retrieved.', data })
  } catch (err) {
    next(err)
  }
}

export const getOne = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const request = await customReqService.getCustomRequestById(req.params['id'] as string)
    res.json({ success: true, message: 'Custom request retrieved.', data: { request } })
  } catch (err) {
    next(err)
  }
}

export const submitBid = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.sellerId) throw new AppError(403, 'Only authenticated sellers can bid on requests.')

    const request = await customReqService.submitBid(
      req.params['id'] as string,
      req.user.sellerId,
      req.body as SubmitBidInput
    )

    res.json({ success: true, message: 'Bid published successfully.', data: { request } })
  } catch (err) {
    next(err)
  }
}

export const acceptBid = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')

    // 1. Trigger the business logic to lock the request and select the winner
    const acceptedPayload = await customReqService.acceptBid(
      req.params['id'] as string,
      req.params['bidId'] as string,
      req.user.id,
      (req.body as AcceptBidInput).shippingAddressId
    )

    // 2. Automagically convert the accepted Request into a Pending Jastip Order!
    const bid = acceptedPayload.bid
    const cr = acceptedPayload.request

    const order = await Order.create({
      userId: req.user.id,
      sellerId: bid.sellerId,
      items: [
        {
          productId: cr._id, // Notice we store the custom request ID as the "pseudo-product" reference so the seller knows
          quantity: 1, // Custom requests are 1:1 right now
          price: bid.price,
          serviceFee: bid.serviceFee,
        },
      ],
      totalProductPrice: bid.price,
      totalServiceFee: bid.serviceFee,
      grandTotal: bid.price + bid.serviceFee,
      shippingAddress: acceptedPayload.userAddress,
      notes: `${cr.productName} (Custom Request - Target: ${cr.targetCountry})`,
      status: 'pending', // Starts pending (waiting for payment)
    })

    res.json({ success: true, message: 'Bid accepted and Order magically generated!', data: { order, request: cr } })
  } catch (err) {
    next(err)
  }
}
