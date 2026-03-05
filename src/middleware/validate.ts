import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../types";

export const validate =
  (schema: ZodSchema, target: "body" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const data = target === "body" ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(", ");
      next(new AppError(400, message));
      return;
    }
    if (target === "body") req.body = result.data;
    next();
  };
