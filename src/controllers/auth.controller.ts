import { Request, Response, NextFunction } from 'express'
import { registerCustomer, registerSeller, registerAdmin, loginUser } from '../services/auth.service'
import {
  CustomerRegisterInput,
  SellerRegisterInput,
  AdminRegisterInput,
  LoginInput,
} from '../validators/auth.validator'
import { ApiResponse } from '../types'

export const registerCustomerHandler = async (
  req: Request<Record<string, never>, ApiResponse, CustomerRegisterInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await registerCustomer(req.body)
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const registerSellerHandler = async (
  req: Request<Record<string, never>, ApiResponse, SellerRegisterInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await registerSeller(req.body)
    res.status(201).json({
      success: true,
      message: 'Seller registered successfully.',
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const registerAdminHandler = async (
  req: Request<Record<string, never>, ApiResponse, AdminRegisterInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await registerAdmin(req.body)
    res.status(201).json({ success: true, message: 'Admin registered successfully.', data })
  } catch (err) {
    next(err)
  }
}

export const login = async (
  req: Request<Record<string, never>, ApiResponse, LoginInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await loginUser(req.body)
    res.json({ success: true, message: 'Login successful.', data })
  } catch (err) {
    next(err)
  }
}
