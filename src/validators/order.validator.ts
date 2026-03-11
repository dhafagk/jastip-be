import { z } from 'zod'

export const checkoutDirectSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
    variantName: z.string().trim().optional(),
    shippingAddressId: z.string().min(1, 'Shipping address ID is required'),
    notes: z.string().optional(),
  }),
})

export const checkoutCartSchema = z.object({
  body: z.object({
    cartItemIds: z.array(z.string()).optional(), // If omitted, checkout entire cart
    shippingAddressId: z.string().min(1, 'Shipping address ID is required'),
    notes: z.string().optional(),
  }),
})

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']),
  }),
})

export type CheckoutDirectInput = z.infer<typeof checkoutDirectSchema>['body']
export type CheckoutCartInput = z.infer<typeof checkoutCartSchema>['body']
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body']
