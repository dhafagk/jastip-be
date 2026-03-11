import { Response, NextFunction } from 'express'
import * as walletService from '../services/wallet.service'
import { AuthRequest, ApiResponse, AppError } from '../types'
import { RequestWithdrawalInput, HandleWithdrawalInput } from '../validators/wallet.validator'

export const getMyWallet = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.sellerId) throw new AppError(403, 'Forbidden. Only sellers have a wallet.')
    const walletData = await walletService.getWalletData(req.user.sellerId)
    res.json({ success: true, message: 'Wallet data retrieved.', data: walletData })
  } catch (err) {
    next(err)
  }
}

export const requestWithdrawal = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.sellerId) throw new AppError(403, 'Forbidden.')
    const { amount } = req.body as RequestWithdrawalInput
    const transaction = await walletService.requestWithdrawal(req.user.sellerId, amount)
    res.status(201).json({ success: true, message: 'Withdrawal requested successfully.', data: { transaction } })
  } catch (err) {
    next(err)
  }
}

export const handleWithdrawal = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw new AppError(403, 'Forbidden. Only admins.')
    const { action } = req.body as HandleWithdrawalInput
    const transaction = await walletService.handleWithdrawal(req.params['id'] as string, action)
    res.json({ success: true, message: `Withdrawal ${action}d successfully.`, data: { transaction } })
  } catch (err) {
    next(err)
  }
}
