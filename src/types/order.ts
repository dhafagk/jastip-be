import { Types, Document } from 'mongoose'
import { IAddress } from './address'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'purchasing'
  | 'arrived_locally'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface IOrderItem {
  productId: Types.ObjectId
  quantity: number
  variantName?: string
  price: number
  serviceFee: number
}

export interface IOrder extends Document {
  userId: Types.ObjectId
  sellerId: Types.ObjectId
  items: Types.DocumentArray<IOrderItem>
  totalProductPrice: number
  totalServiceFee: number
  grandTotal: number
  depositAmount: number
  remainingBalance: number
  paymentStatus: 'unpaid' | 'deposit_paid' | 'fully_paid'
  shippingAddress: IAddress
  status: OrderStatus
  courier?: string
  trackingNumber?: string
  imageProofs: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
