import { Types, Document } from 'mongoose'

export interface ICartItem {
  productId: Types.ObjectId
  quantity: number
  variantName?: string
  addedAt: Date
}

export interface ICart extends Document {
  userId: Types.ObjectId
  items: Types.DocumentArray<ICartItem>
  createdAt: Date
  updatedAt: Date
}
