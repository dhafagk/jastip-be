import { Types, Document } from 'mongoose'
import { IAddress } from './address'
import { Role } from './auth'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: Role
  avatarUrl?: string
  sellerId?: Types.ObjectId
  addresses: Types.DocumentArray<IAddress>
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}
