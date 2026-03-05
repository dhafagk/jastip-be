import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { ApiResponse } from "../types";

export const register = async (
  req: Request<Record<string, never>, ApiResponse, RegisterInput>,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await registerUser(req.body);
    res
      .status(201)
      .json({ success: true, message: "User registered successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<Record<string, never>, ApiResponse, LoginInput>,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await loginUser(req.body);
    res.json({ success: true, message: "Login successful.", data });
  } catch (err) {
    next(err);
  }
};
