import { z } from 'zod'

const customRequestStatusValues = ['open', 'quoted', 'accepted', 'rejected', 'cancelled'] as const
const bidStatusValues = ['pending', 'accepted', 'rejected'] as const

export const createCustomRequestSchema = z.object({
  targetSellerId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  productUrl: z.string().url('Product URL must be valid').optional().or(z.literal('')),
  imageUrls: z
    .array(z.string().url('Each image URL must be valid'))
    .max(5, 'Maximum of 5 request images allowed')
    .default([]),
  targetCountry: z.string().min(1, 'Target country is required'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
})

export const submitBidSchema = z.object({
  price: z.number().min(0, 'Price cannot be negative'),
  serviceFee: z.number().min(0, 'Service fee cannot be negative').default(0),
  estimatedDeliveryDate: z.string().datetime({ message: 'Must be a valid ISO Date' }),
  notes: z.string().optional(),
})

export const acceptBidSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address ID is required'),
})

export const listCustomRequestsQuerySchema = z.object({
  targetSupplierId: z.string().optional(),
  targetCountry: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(customRequestStatusValues).optional(),
  page: z
    .string()
    .regex(/^[1-9]\d*$/, 'page must be a positive integer')
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, 'limit must be a positive integer')
    .optional(),
})

export type CreateCustomRequestInput = z.infer<typeof createCustomRequestSchema>
export type SubmitBidInput = z.infer<typeof submitBidSchema>
export type AcceptBidInput = z.infer<typeof acceptBidSchema>
export type ListCustomRequestsQuery = z.infer<typeof listCustomRequestsQuerySchema>
