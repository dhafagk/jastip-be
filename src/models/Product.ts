import { Schema, model, Document, Types } from "mongoose";

export type ProductStatus =
  | "available"
  | "ordered"
  | "onTheWay"
  | "delivered"
  | "cancelled";

export interface IProductVariant {
  name: string;
  value: string;
  extraPrice: number;
  stock: number;
}

export interface IReview {
  userId: Types.ObjectId;
  userName: string;
  userAvatarUrl: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  serviceFee: number;
  imageUrls: string[];
  category: string;
  originCity: string;
  currency: string;
  quantity: number;
  status: ProductStatus;
  seller: Types.ObjectId;
  reviews: IReview[];
  variants: IProductVariant[];
  tags: string[];
  totalSold: number;
  isAvailableForOrder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    extraPrice: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true },
);

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true, trim: true },
    userAvatarUrl: { type: String, required: true, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    imageUrls: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    serviceFee: {
      type: Number,
      required: true,
      min: [0, "Service fee cannot be negative"],
      default: 0,
    },
    imageUrls: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    originCity: {
      type: String,
      required: [true, "Origin city is required"],
      trim: true,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      default: "IDR",
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: ["available", "ordered", "onTheWay", "delivered", "cancelled"],
      required: true,
      default: "available",
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller is required"],
      index: true,
    },
    reviews: { type: [reviewSchema], default: [] },
    variants: { type: [variantSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    totalSold: {
      type: Number,
      required: true,
      min: [0, "Total sold cannot be negative"],
      default: 0,
    },
    isAvailableForOrder: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Product = model<IProduct>("Product", productSchema);
export default Product;
