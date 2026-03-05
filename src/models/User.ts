import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "../types";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  sellerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "seller", "customer"],
      required: true,
      default: "customer",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      default: undefined,
    },
  },
  { timestamps: true },
);

userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User = model<IUser>("User", userSchema);
export default User;
