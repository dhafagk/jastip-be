import { Response, NextFunction } from 'express'
import * as orderService from '../services/order.service'
import { AuthRequest, ApiResponse, AppError } from '../types'
import { CheckoutDirectInput, UpdateOrderStatusInput } from '../validators/order.validator'

export const checkoutDirect = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const order = await orderService.checkoutDirect(req.user.id, req.body as CheckoutDirectInput)
    res.status(201).json({ success: true, message: 'Order created successfully.', data: { order } })
  } catch (err) {
    next(err)
  }
}

export const getMyOrders = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const orders = await orderService.getUserOrders(req.user.id)
    res.json({ success: true, message: 'Orders retrieved.', data: { orders } })
  } catch (err) {
    next(err)
  }
}

export const getSellerOrders = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Basic authorization check: the seller can only see their own orders
    if (!req.user || (req.user.role !== 'admin' && req.user.sellerId !== req.params.sellerId)) {
      throw new AppError(403, 'Forbidden.')
    }
    const orders = await orderService.getSellerOrders(req.params['sellerId'] as string)
    res.json({ success: true, message: 'Seller orders retrieved.', data: { orders } })
  } catch (err) {
    next(err)
  }
}

export const updateStatus = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.sellerId) throw new AppError(403, 'Only sellers can update order status.')
    const { status, courier, trackingNumber, proofImageUrl } = req.body as UpdateOrderStatusInput
    const order = await orderService.updateOrderStatus(
      req.params['id'] as string,
      req.user.sellerId,
      status,
      courier,
      trackingNumber,
      proofImageUrl
    )
    res.json({ success: true, message: 'Order status updated.', data: { order } })
  } catch (err) {
    next(err)
  }
}

export const processPayment = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const order = await orderService.processPayment(req.params['id'] as string, req.user.id)
    res.json({ success: true, message: 'Payment processed successfully.', data: { order } })
  } catch (err) {
    next(err)
  }
}

export const cancel = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const order = await orderService.cancelOrder(req.params['id'] as string, req.user.id)
    res.json({ success: true, message: 'Order cancelled successfully.', data: { order } })
  } catch (err) {
    next(err)
  }
}

export const complete = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const order = await orderService.completeOrder(req.params['id'] as string, req.user.id)
    res.json({ success: true, message: 'Order marked as delivered successfully.', data: { order } })
  } catch (err) {
    next(err)
  }
}
