import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    avatarUrl: z.string().url('Avatar must be a valid URL').optional(),
  }),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
