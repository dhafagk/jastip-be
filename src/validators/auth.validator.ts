import { z } from "zod";

const baseRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerRegisterSchema = baseRegisterSchema;

export const sellerRegisterSchema = baseRegisterSchema.extend({
  avatarUrl: z.string().url("Avatar URL must be a valid URL"),
  currentCity: z.string().min(1, "Current city is required"),
});

export const adminRegisterSchema = baseRegisterSchema;

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
