import { Router } from 'express'
import * as orderController from '../controllers/order.controller'
import { authenticate } from '../middleware/auth'
import { authorize, authorizeSeller } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { checkoutDirectSchema, checkoutCartSchema, updateOrderStatusSchema } from '../validators/order.validator'

const router = Router()

// Customer endpoints
router.post(
  '/checkout/direct',
  authenticate,
  authorize('customer'),
  validate(checkoutDirectSchema),
  orderController.checkoutDirect
)
router.post(
  '/checkout/cart',
  authenticate,
  authorize('customer'),
  validate(checkoutCartSchema),
  orderController.checkoutCart
)
router.get('/me', authenticate, authorize('customer'), orderController.getMyOrders)

// Mock Payment
router.post('/:id/payment', authenticate, authorize('customer'), orderController.processPayment)

// Order Lifecycle (Customer)
router.post('/:id/cancel', authenticate, authorize('customer'), orderController.cancel)
router.post('/:id/complete', authenticate, authorize('customer'), orderController.complete)

// Seller endpoints
router.get('/seller/:sellerId', authenticate, orderController.getSellerOrders)
router.patch(
  '/:id/status',
  authenticate,
  authorize('seller'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
)

export default router
