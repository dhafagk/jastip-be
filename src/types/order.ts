import { Types, Document } from 'mongoose'
import { IAddress } from './address'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

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
  shippingAddress: IAddress
  status: OrderStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}
