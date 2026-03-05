import User from "../models/User";
import { AppError } from "../types";

export const getUserById = async (id: string) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new AppError(404, "User not found.");
  return user;
};
