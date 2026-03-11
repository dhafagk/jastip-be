import { Response, NextFunction } from 'express'
import { AuthRequest, ApiResponse, AppError } from '../types'
import * as uploadService from '../services/upload.service'

export const uploadImage = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized.')
    }

    if (!req.file) {
      throw new AppError(400, 'No image file provided.')
    }

    const publicUrl = await uploadService.uploadImageToSupabase(req.file)

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        imageUrl: publicUrl,
      },
    })
  } catch (err) {
    next(err)
  }
}
