import jwt from "jsonwebtoken";
import User from "../models/User";
import Seller from "../models/Seller";
import { AppError, Role } from "../types";
import { env } from "../config/env";
import {
  CustomerRegisterInput,
  SellerRegisterInput,
  AdminRegisterInput,
  LoginInput,
} from "../validators/auth.validator";

const signToken = (
  id: string,
  email: string,
  role: Role,
  sellerId?: string,
): string =>
  jwt.sign({ id, email, role, ...(sellerId && { sellerId }) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);

export const registerCustomer = async (input: CustomerRegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError(409, "Email already registered.");

  const user = await User.create({ ...input, role: "customer" });
  const token = signToken(user._id.toString(), user.email, "customer");

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const registerSeller = async (input: SellerRegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError(409, "Email already registered.");

  const seller = await Seller.create({
    name: input.name,
    avatarUrl: input.avatarUrl,
    currentCity: input.currentCity,
  });

  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: "seller",
      sellerId: seller._id,
    });

    const token = signToken(
      user._id.toString(),
      user.email,
      "seller",
      seller._id.toString(),
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerId: seller._id,
      },
    };
  } catch (err) {
    await Seller.findByIdAndDelete(seller._id);
    throw err;
  }
};

export const registerAdmin = async (input: AdminRegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError(409, "Email already registered.");

  const user = await User.create({ ...input, role: "admin" });
  const token = signToken(user._id.toString(), user.email, "admin");

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new AppError(401, "Invalid credentials.");

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials.");

  const token = signToken(
    user._id.toString(),
    user.email,
    user.role,
    user.sellerId?.toString(),
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.sellerId && { sellerId: user.sellerId }),
    },
  };
};
