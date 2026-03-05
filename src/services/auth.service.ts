import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError } from "../types";
import { env } from "../config/env";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

const signToken = (id: string, email: string): string =>
  jwt.sign({ id, email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError(409, "Email already registered.");

  const user = await User.create(input);
  const token = signToken(user._id.toString(), user.email);

  return { token, user: { id: user._id, name: user.name, email: user.email } };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new AppError(401, "Invalid credentials.");

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials.");

  const token = signToken(user._id.toString(), user.email);

  return { token, user: { id: user._id, name: user.name, email: user.email } };
};
