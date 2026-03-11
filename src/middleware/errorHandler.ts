import { Request, Response, NextFunction } from 'express'
import { AppError } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (err: unknown): err is Record<string, any> => typeof err === 'object' && err !== null

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message })
    return
  }

  if (isObject(err)) {
    if (err['name'] === 'ValidationError') {
      res.status(400).json({ success: false, message: String(err['message']) })
      return
    }
    if (err['name'] === 'MongoServerError' && err['code'] === 11000) {
      res.status(409).json({ success: false, message: 'Duplicate field value.' })
      return
    }
  }

  console.error(err)
  res.status(500).json({ success: false, message: 'Internal server error.' })
}
