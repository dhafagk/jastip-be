import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { authorize, authorizeSeller } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import {
  createSellerSchema,
  updateSellerSchema,
  listSellersQuerySchema,
  addSellerReviewSchema,
} from '../validators/seller.validator'
import { addAddressSchema, updateAddressSchema } from '../validators/address.validator'
import {
  list,
  getOne,
  create,
  update,
  remove,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  addReview,
  requestVerification,
  approveVerification,
  rejectVerification,
} from '../controllers/seller.controller'

const router = Router()

router.get('/', validate(listSellersQuerySchema, 'query'), list)
router.get('/:id', getOne)

router.post('/', authenticate, authorize('admin'), validate(createSellerSchema), create)
router.delete('/:id', authenticate, authorize('admin'), remove)

router.patch('/:id', authenticate, authorizeSeller, validate(updateSellerSchema), update)

// Address Management
router.post('/:id/addresses', authenticate, authorizeSeller, validate(addAddressSchema), addAddress)
router.patch('/:id/addresses/:addressId', authenticate, authorizeSeller, validate(updateAddressSchema), updateAddress)
router.patch('/:id/addresses/:addressId/default', authenticate, authorizeSeller, setDefaultAddress)
router.delete('/:id/addresses/:addressId', authenticate, authorizeSeller, removeAddress)

// Reviews
router.post('/:id/reviews', authenticate, authorize('customer'), validate(addSellerReviewSchema), addReview)

// Verification
router.post('/:id/verify-request', authenticate, authorizeSeller, requestVerification)
router.post('/:id/verify-approve', authenticate, authorize('admin'), approveVerification)
router.post('/:id/verify-reject', authenticate, authorize('admin'), rejectVerification)

export default router
