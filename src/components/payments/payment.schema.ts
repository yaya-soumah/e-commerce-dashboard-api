import * as z from 'zod'

export const PaymentCreateSchema = z.object({
  status: z.enum(['unpaid', 'paid', 'refunded', 'failed', 'pending'], {
    error: 'Invalid payment method',
  }),
  method: z.enum(['cash', 'credit_card', 'bank_transfer', 'manual'], {
    error: 'Invalid payment status',
  }),
  transactionId: z.string().optional(),
  paidAt: z.string().optional(),
  amount: z.number(),
  notes: z.string().optional(),
})

export const PaymentUpdateSchema = z.object({
  status: z
    .enum(['unpaid', 'paid', 'refunded', 'failed', 'pending'], { error: 'Invalid payment method' })
    .optional(),
  method: z
    .enum(['cash', 'credit_card', 'bank_transfer', 'manual'], { error: 'Invalid payment status' })
    .optional(),
  transactionId: z.string().optional(),
  paidAt: z.string().optional(),
  amount: z.number().optional(),
  notes: z.string().optional(),
})
