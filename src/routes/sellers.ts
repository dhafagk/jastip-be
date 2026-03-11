import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { authorize, authorizeSeller } from '../middleware/authorize'
import { validate } from '../middleware/validate'
import { createSellerSchema, updateSellerSchema, listSellersQuerySchema } from '../validators/seller.validator'
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

export default router
