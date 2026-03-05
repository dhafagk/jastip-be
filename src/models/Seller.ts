import { Schema, model, Document } from "mongoose";

export interface ISeller extends Document {
  name: string;
  avatarUrl: string;
  currentCity: string;
  rating: number;
  totalTransactions: number;
  isVerified: boolean;
}

const sellerSchema = new Schema<ISeller>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    avatarUrl: {
      type: String,
      required: [true, "Avatar URL is required"],
      trim: true,
    },
    currentCity: {
      type: String,
      required: [true, "Current city is required"],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating must be at most 5"],
      default: 0,
    },
    totalTransactions: {
      type: Number,
      required: true,
      min: [0, "Total transactions cannot be negative"],
      default: 0,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

const Seller = model<ISeller>("Seller", sellerSchema);
export default Seller;
