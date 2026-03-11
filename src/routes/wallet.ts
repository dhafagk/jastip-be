import { Router } from 'express'
import * as walletController from '../controllers/wallet.controller'
import { authenticate } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { requestWithdrawalSchema, handleWithdrawalSchema } from '../validators/wallet.validator'

const router = Router()

router.get('/me', authenticate, authorize('seller'), walletController.getMyWallet)
router.post(
  '/withdraw',
  authenticate,
  authorize('seller'),
  validate(requestWithdrawalSchema),
  walletController.requestWithdrawal
)

// Admin endpoints
router.post(
  '/:id/handle',
  authenticate,
  authorize('admin'),
  validate(handleWithdrawalSchema),
  walletController.handleWithdrawal
)

export default router
