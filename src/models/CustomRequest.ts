import { Schema, model } from 'mongoose'
import { ICustomRequest, ICustomRequestBid } from '../types'

const bidSchema = new Schema<ICustomRequestBid>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    serviceFee: { type: Number, required: true, min: [0, 'Service fee cannot be negative'] },
    estimatedDeliveryDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const customRequestSchema = new Schema<ICustomRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetSellerId: { type: Schema.Types.ObjectId, ref: 'Seller', index: true },
    productName: { type: String, required: true, trim: true },
    productUrl: { type: String, trim: true },
    imageUrls: { type: [String], default: [] },
    targetCountry: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['open', 'quoted', 'accepted', 'rejected', 'cancelled'],
      default: 'open',
      required: true,
      index: true,
    },
    bids: { type: [bidSchema], default: [] },
  },
  { timestamps: true }
)

const CustomRequest = model<ICustomRequest>('CustomRequest', customRequestSchema)
export default CustomRequest
