import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { addAddressSchema, updateAddressSchema } from '../validators/address.validator'
import { getMe, addAddress, updateAddress, removeAddress, setDefaultAddress } from '../controllers/user.controller'

const router = Router()

router.use(authenticate)
router.get('/me', getMe)

// Address Management
router.post('/me/addresses', validate(addAddressSchema), addAddress)
router.patch('/me/addresses/:addressId', validate(updateAddressSchema), updateAddress)
router.patch('/me/addresses/:addressId/default', setDefaultAddress)
router.delete('/me/addresses/:addressId', removeAddress)

export default router
