import { Schema, model } from 'mongoose'
import { IWalletTransaction } from '../types'

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    type: {
      type: String,
      enum: ['earning', 'withdrawal'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than zero'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

const WalletTransaction = model<IWalletTransaction>('WalletTransaction', walletTransactionSchema)
export default WalletTransaction
