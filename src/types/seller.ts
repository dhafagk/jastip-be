import { Types, Document } from 'mongoose'
import { IAddress } from './address'

export interface ISeller extends Document {
  name: string
  avatarUrl: string
  currentCity: string
  rating: number
  totalTransactions: number
  isVerified: boolean
  balance: number
  addresses: Types.DocumentArray<IAddress>
}
