import { Router } from 'express'
import * as cartController from '../controllers/cart.controller'
import { authenticate } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator'

const router = Router()

router.use(authenticate, authorize('customer'))

router.get('/', cartController.getMyCart)

router.post('/', validate(addToCartSchema), cartController.addItem)

router.patch('/:itemId', validate(updateCartItemSchema), cartController.updateItem)

router.delete('/:itemId', cartController.removeItem)

router.delete('/', cartController.clearMyCart)

export default router
