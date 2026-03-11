import { z } from 'zod'

export const requestWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be strictly positive'),
  }),
})

export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>['body']

export const handleWithdrawalSchema = z.object({
  body: z.object({
    action: z.enum(['approve', 'reject']),
  }),
})

export type HandleWithdrawalInput = z.infer<typeof handleWithdrawalSchema>['body']
