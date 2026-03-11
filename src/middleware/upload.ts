import multer from 'multer'
import { AppError } from '../types'

// Use memory storage to temporarily hold the file before sending to Supabase S3
const storage = multer.memoryStorage()

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true)
  } else {
    cb(new AppError(400, 'Unsupported file format. Only JPEG, PNG, and WebP are allowed.'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})
