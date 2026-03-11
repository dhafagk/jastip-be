import { z } from 'zod'

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., 'Home', 'Office')"),
  recipientName: z.string().min(1, 'Recipient name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Indonesia'),
  isDefault: z.boolean().default(false),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
})

export const addAddressSchema = z.object({
  body: addressSchema,
})

export const updateAddressSchema = z.object({
  body: addressSchema.partial(),
})

export type AddressInput = z.infer<typeof addressSchema>
export type UpdateAddressInput = z.infer<typeof addressSchema> extends Partial<infer T> ? Partial<T> : never // Typescript trick to infer partial type properly, but using standard z.infer on partial is safer.
// So:
export type PartialAddressInput = z.infer<typeof updateAddressSchema>['body']
