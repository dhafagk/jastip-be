import { Schema, model, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { IUser, IAddress } from '../types'
import { Role } from '../types'

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

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'seller', 'customer'],
      required: true,
      default: 'customer',
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      default: undefined,
    },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
)

userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

const User = model<IUser>('User', userSchema)
export default User
