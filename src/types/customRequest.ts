import { Types, Document } from 'mongoose'

export type CustomRequestStatus = 'open' | 'quoted' | 'accepted' | 'rejected' | 'cancelled'
export type BidStatus = 'pending' | 'accepted' | 'rejected'

export interface ICustomRequestBid {
  sellerId: Types.ObjectId
  price: number
  serviceFee: number
  estimatedDeliveryDate: Date
  notes?: string
  status: BidStatus
  createdAt: Date
}

export interface ICustomRequest extends Document {
  userId: Types.ObjectId
  targetSellerId?: Types.ObjectId
  productName: string
  productUrl?: string
  imageUrls: string[]
  targetCountry: string
  category: string
  notes?: string
  status: CustomRequestStatus
  bids: Types.DocumentArray<ICustomRequestBid>
  createdAt: Date
  updatedAt: Date
}
