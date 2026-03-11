import { Types, Document } from 'mongoose'

export type WalletTransactionType = 'earning' | 'withdrawal'
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed'

export interface IWalletTransaction extends Document {
  sellerId: Types.ObjectId
  orderId?: Types.ObjectId
  type: WalletTransactionType
  amount: number
  status: WalletTransactionStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}
