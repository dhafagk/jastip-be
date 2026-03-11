import { Router } from 'express'
import * as customReqController from '../controllers/customRequest.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  createCustomRequestSchema,
  submitBidSchema,
  acceptBidSchema,
  listCustomRequestsQuerySchema,
} from '../validators/customRequest.validator'

const router = Router()

// Public / General matching routes
router.get('/', validate(listCustomRequestsQuerySchema), customReqController.list)
router.get('/:id', customReqController.getOne)

// Protected Buyer Actions
router.post('/', authenticate, validate(createCustomRequestSchema), customReqController.create)
router.post('/:id/bids/:bidId/accept', authenticate, validate(acceptBidSchema), customReqController.acceptBid)

// Protected Seller Actions
router.post('/:id/bids', authenticate, validate(submitBidSchema), customReqController.submitBid)

export default router
