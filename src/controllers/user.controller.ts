import { Response, NextFunction } from 'express'
import * as userService from '../services/user.service'
import { AuthRequest, ApiResponse, AppError } from '../types'
import { AddressInput, PartialAddressInput } from '../validators/address.validator'

export const getMe = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.getUserById(req.user.id)
    res.json({ success: true, message: 'User retrieved.', data: { user } })
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string }
    const user = await userService.updateProfile(req.user.id, { name, avatarUrl })
    res.json({ success: true, message: 'Profile updated.', data: { user } })
  } catch (err) {
    next(err)
  }
}

export const addAddress = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.addAddress(req.user.id, req.body as AddressInput)
    res.status(201).json({ success: true, message: 'Address added.', data: { user } })
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
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.updateAddress(
      req.user.id,
      req.params['addressId'] as string,
      req.body as PartialAddressInput
    )
    res.json({ success: true, message: 'Address updated.', data: { user } })
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
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.removeAddress(req.user.id, req.params['addressId'] as string)
    res.json({ success: true, message: 'Address removed.', data: { user } })
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
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.setDefaultAddress(req.user.id, req.params['addressId'] as string)
    res.json({
      success: true,
      message: 'Default address set.',
      data: { user },
    })
  } catch (err) {
    next(err)
  }
}

// --- Favorites ---

export const toggleFavoriteSeller = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.toggleFavoriteSeller(req.user.id, req.params['sellerId'] as string)
    res.json({ success: true, message: 'Favorite seller toggled.', data: { user } })
  } catch (err) {
    next(err)
  }
}

export const toggleFavoriteProduct = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const user = await userService.toggleFavoriteProduct(req.user.id, req.params['productId'] as string)
    res.json({ success: true, message: 'Favorite product toggled.', data: { user } })
  } catch (err) {
    next(err)
  }
}
