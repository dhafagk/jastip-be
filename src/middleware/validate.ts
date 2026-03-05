import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../types";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(", ");
      next(new AppError(400, message));
      return;
    }
    req.body = result.data;
    next();
  };
