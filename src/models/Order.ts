import { Schema, model } from 'mongoose'
import { IOrder, IOrderItem } from '../types'

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    variantName: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
  },
  { _id: true }
)

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, 'An order must have at least one item.'],
    },
    totalProductPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalServiceFee: {
      type: Number,
      required: true,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: Schema.Types.Mixed, // Storing a copy of the IAddress object
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'purchasing', 'arrived_locally', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      required: true,
      index: true,
    },
    imageProofs: {
      type: [String],
      default: [],
    },
    courier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
)

const Order = model<IOrder>('Order', orderSchema)
export default Order
