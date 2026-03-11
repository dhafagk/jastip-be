import { Schema, model, Types } from 'mongoose'
import { ICart, ICartItem } from '../types'

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    variantName: { type: String, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
)

const Cart = model<ICart>('Cart', cartSchema)
export default Cart
