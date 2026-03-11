import { Types, Document } from 'mongoose'

export type ProductStatus =
  | 'available'
  | 'ordered'
  | 'purchasing'
  | 'arrived_locally'
  | 'onTheWay'
  | 'delivered'
  | 'cancelled'

export interface IProductVariant {
  name: string
  value: string
  extraPrice: number
  stock: number
  imageUrl?: string
}

export interface IReview {
  userId: Types.ObjectId
  userName: string
  userAvatarUrl: string
  rating: number
  comment: string
  imageUrls: string[]
  createdAt: Date
}

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  serviceFee: number
  imageUrls: string[]
  category: string
  originCity: string
  currency: string
  quantity: number
  status: ProductStatus
  seller: Types.ObjectId
  reviews: IReview[]
  variants: IProductVariant[]
  tags: string[]
  totalSold: number
  isAvailableForOrder: boolean
  isPreOrder: boolean
  poCloseDate?: Date
  estimatedDeliveryDate?: Date
  createdAt: Date
  updatedAt: Date
}
