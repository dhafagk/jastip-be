import { Response, NextFunction } from "express";
import { getUserById } from "../services/user.service";
import { AuthRequest, ApiResponse } from "../types";

export const getMe = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await getUserById(req.user!.id);
    res.json({
      success: true,
      message: "Authenticated user info.",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
