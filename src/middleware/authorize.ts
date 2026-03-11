import { Response, NextFunction } from 'express'
import { AuthRequest, AppError, Role } from '../types'

export const authorize =
  (...roles: Role[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'Forbidden. Insufficient permissions.'))
      return
    }
    next()
  }

/**
 * Allows admins to proceed freely.
 * Allows sellers only if their sellerId matches the :id param.
 */
export const authorizeSeller = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError(401, 'Access denied. No token provided.'))
    return
  }
  if (req.user.role === 'admin') {
    next()
    return
  }
  if (req.user.role === 'seller' && req.user.sellerId === req.params.id) {
    next()
    return
  }
  next(new AppError(403, 'Forbidden. You can only modify your own seller profile.'))
}
