import { Schema, model, Types } from 'mongoose'
import { ISeller, IAddress } from '../types'

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, trim: true },
    recipientName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'Indonesia', trim: true },
    isDefault: { type: Boolean, default: false },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { _id: true }
)

const sellerSchema = new Schema<ISeller>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    avatarUrl: {
      type: String,
      required: [true, 'Avatar URL is required'],
      trim: true,
    },
    currentCity: {
      type: String,
      required: [true, 'Current city is required'],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5'],
      default: 0,
    },
    totalTransactions: {
      type: Number,
      required: true,
      min: [0, 'Total transactions cannot be negative'],
      default: 0,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      min: [0, 'Balance cannot be negative'],
      default: 0,
    },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
)

const Seller = model<ISeller>('Seller', sellerSchema)
export default Seller
