import { Response, NextFunction } from 'express'
import * as cartService from '../services/cart.service'
import { AuthRequest, ApiResponse, AppError } from '../types'
import { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator'

export const getMyCart = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const cart = await cartService.getCart(req.user.id)
    res.json({ success: true, message: 'Cart retrieved.', data: { cart } })
  } catch (err) {
    next(err)
  }
}

export const addItem = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const cart = await cartService.addToCart(req.user.id, req.body as AddToCartInput)
    res.status(201).json({ success: true, message: 'Item added to cart.', data: { cart } })
  } catch (err) {
    next(err)
  }
}

export const updateItem = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const cart = await cartService.updateCartItemQuantity(
      req.user.id,
      req.params['itemId'] as string,
      req.body as UpdateCartItemInput
    )
    res.json({ success: true, message: 'Cart item updated.', data: { cart } })
  } catch (err) {
    next(err)
  }
}

export const removeItem = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const cart = await cartService.removeFromCart(req.user.id, req.params['itemId'] as string)
    res.json({
      success: true,
      message: 'Item removed from cart.',
      data: { cart },
    })
  } catch (err) {
    next(err)
  }
}

export const clearMyCart = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized.'))
      return
    }
    const cart = await cartService.clearCart(req.user.id)
    res.json({ success: true, message: 'Cart cleared.', data: { cart } })
  } catch (err) {
    next(err)
  }
}
