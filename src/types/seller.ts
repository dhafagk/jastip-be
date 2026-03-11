import { Types, Document } from 'mongoose'
import { IAddress } from './address'
import { IReview } from './product'

export interface ISeller extends Document {
  name: string
  avatarUrl: string
  currentCity: string
  rating: number
  totalTransactions: number
  isVerified: boolean
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected'
  verificationRequestDate?: Date
  balance: number
  frequentCountries: string[]
  productNiches: string[]
  reviews: IReview[]
  addresses: Types.DocumentArray<IAddress>
}
