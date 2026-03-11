import { z } from "zod";

const productStatusValues = [
  "available",
  "ordered",
  "onTheWay",
  "delivered",
  "cancelled",
] as const;

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  value: z.string().min(1, "Variant value is required"),
  extraPrice: z.number().min(0, "Extra price cannot be negative").default(0),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price cannot be negative"),
  serviceFee: z.number().min(0, "Service fee cannot be negative").default(0),
  imageUrls: z
    .array(z.string().url("Each image URL must be valid"))
    .default([]),
  category: z.string().min(1, "Category is required"),
  originCity: z.string().min(1, "Origin city is required"),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("IDR"),
  quantity: z.number().int().min(0, "Quantity cannot be negative").default(0),
  status: z.enum(productStatusValues).default("available"),
  variants: z.array(variantSchema).default([]),
  tags: z.array(z.string()).default([]),
  isAvailableForOrder: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema
  .omit({ currency: true })
  .partial()
  .extend({
    currency: z
      .string()
      .length(3, "Currency must be a 3-letter code")
      .optional(),
  });

export const addReviewSchema = z.object({
  userAvatarUrl: z.string().url("User avatar URL must be valid").optional().default(""),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required"),
  imageUrls: z
    .array(z.string().url("Each image URL must be valid"))
    .default([]),
});

export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(productStatusValues).optional(),
  sellerId: z.string().optional(),
  originCity: z.string().optional(),
  tag: z.string().optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "minPrice must be a number")
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "maxPrice must be a number")
    .optional(),
  isAvailableForOrder: z.enum(["true", "false"]).optional(),
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "page must be a positive integer")
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "limit must be a positive integer")
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AddReviewInput = z.infer<typeof addReviewSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
