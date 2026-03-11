import { Request, Response, NextFunction } from 'express'
import * as sellerService from '../services/seller.service'
import {
  CreateSellerInput,
  UpdateSellerInput,
  ListSellersQuery,
  AddSellerReviewInput,
} from '../validators/seller.validator'
import { AddressInput, PartialAddressInput } from '../validators/address.validator'
import { ApiResponse, AppError, AuthRequest } from '../types'

export const list = async (
  req: Request<Record<string, never>, ApiResponse, Record<string, never>, ListSellersQuery>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await sellerService.listSellers(req.query)
    res.json({ success: true, message: 'Sellers retrieved.', data })
  } catch (err) {
    next(err)
  }
}

export const getOne = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.getSellerById(req.params.id)
    res.json({ success: true, message: 'Seller retrieved.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const create = async (
  req: Request<Record<string, never>, ApiResponse, CreateSellerInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.createSeller(req.body)
    res.status(201).json({ success: true, message: 'Seller created.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const update = async (
  req: Request<{ id: string }, ApiResponse, UpdateSellerInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.updateSeller(req.params.id, req.body)
    res.json({ success: true, message: 'Seller updated.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const remove = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    await sellerService.deleteSeller(req.params.id)
    res.json({ success: true, message: 'Seller deleted.' })
  } catch (err) {
    next(err)
  }
}

// --- Address Management ---

export const addAddress = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const seller = await sellerService.addAddress(req.params['id'] as string, req.body as AddressInput)
    res.status(201).json({ success: true, message: 'Address added.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const updateAddress = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.updateAddress(
      req.params['id'] as string,
      req.params['addressId'] as string,
      req.body as PartialAddressInput
    )
    res.json({ success: true, message: 'Address updated.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const removeAddress = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.removeAddress(req.params['id'] as string, req.params['addressId'] as string)
    res.json({ success: true, message: 'Address removed.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const setDefaultAddress = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.setDefaultAddress(req.params['id'] as string, req.params['addressId'] as string)
    res.json({
      success: true,
      message: 'Default address set.',
      data: { seller },
    })
  } catch (err) {
    next(err)
  }
}

export const addReview = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const seller = await sellerService.addReview(
      req.params['id'] as string,
      req.body as AddSellerReviewInput,
      req.user.id
    )
    res.status(201).json({ success: true, message: 'Review added.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

// --- Verification ---

export const requestVerification = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthorized.')
    const seller = await sellerService.requestVerification(req.params['id'] as string)
    res.json({ success: true, message: 'Verification request submitted. Pending admin approval.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const approveVerification = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.approveVerification(req.params['id'] as string)
    res.json({ success: true, message: 'Seller officially verified.', data: { seller } })
  } catch (err) {
    next(err)
  }
}

export const rejectVerification = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const seller = await sellerService.rejectVerification(req.params['id'] as string)
    res.json({ success: true, message: 'Seller verification rejected.', data: { seller } })
  } catch (err) {
    next(err)
  }
}
