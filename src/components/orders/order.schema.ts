import { z } from 'zod'

export const OrderSchema = z.object({
  customerName: z.string(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
    }),
  ),
  shippingAddress: z.string(),
  notes: z.string().optional(),
})

export const UpdateOrderSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['unpaid', 'paid', 'refunded', 'failed']).optional(),
})

export const FilterOrderSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerName: z.string().optional(),
})
