import { Router } from 'express'
import * as uploadController from '../controllers/upload.controller'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

// Only authenticated users (Customer, Seller, Admin) can upload images
router.post('/image', authenticate, upload.single('image'), uploadController.uploadImage)

export default router
