import { z } from 'zod'

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
    variantName: z.string().trim().optional(),
  }),
})

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>['body']
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body']
