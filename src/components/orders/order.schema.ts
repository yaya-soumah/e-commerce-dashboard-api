import { z } from 'zod'

export const OrderSchema = z.object({
  customerName: z.string(),
  userId: z.number(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
    }),
  ),
  shippingAddress: z.string(),
  notes: z.string().optional(),
})
