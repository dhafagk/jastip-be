import { Request } from 'express'

export type Role = 'admin' | 'seller' | 'customer'

export interface JwtPayload {
  id: string
  email: string
  role: Role
  sellerId?: string
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}
