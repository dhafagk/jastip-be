import { z } from "zod";

export const createSellerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url("Avatar URL must be a valid URL"),
  currentCity: z.string().min(1, "Current city is required"),
  rating: z
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5")
    .default(0),
  totalTransactions: z
    .number()
    .int("Total transactions must be an integer")
    .min(0, "Total transactions cannot be negative")
    .default(0),
  isVerified: z.boolean().default(false),
});

export const updateSellerSchema = createSellerSchema.partial();

export const listSellersQuerySchema = z.object({
  city: z.string().optional(),
  isVerified: z.enum(["true", "false"]).optional(),
  minRating: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "minRating must be a number")
    .optional(),
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "page must be a positive integer")
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "limit must be a positive integer")
    .optional(),
});

export type CreateSellerInput = z.infer<typeof createSellerSchema>;
export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;
export type ListSellersQuery = z.infer<typeof listSellersQuerySchema>;
