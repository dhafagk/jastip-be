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

export const updateOrderStatusSchema = z
  .object({
    body: z.object({
      status: z.enum(['processing', 'purchasing', 'arrived_locally', 'shipped', 'delivered', 'cancelled']),
      courier: z.string().trim().optional(),
      trackingNumber: z.string().trim().optional(),
      proofImageUrl: z.string().url('Proof image must be a valid URL').optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.body.status === 'shipped') {
      if (!data.body.courier) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Courier is required when status is shipped',
          path: ['body', 'courier'],
        })
      }
      if (!data.body.trackingNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tracking number is required when status is shipped',
          path: ['body', 'trackingNumber'],
        })
      }
    }
    if (data.body.status === 'purchasing' || data.body.status === 'arrived_locally') {
      if (!data.body.proofImageUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A proofImageUrl is required to update to this status for transparency',
          path: ['body', 'proofImageUrl'],
        })
      }
    }
  })

export type CheckoutDirectInput = z.infer<typeof checkoutDirectSchema>['body']
export type CheckoutCartInput = z.infer<typeof checkoutCartSchema>['body']
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body']
