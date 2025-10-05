import { z } from 'zod'

export const OrderSchema = z.object({
  orderNumber: z.number(),
  userId: z.number(),
  products: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    }),
  ),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled']),
  paymentStatus: z.enum(['unpaid', 'paid', 'refunded', 'failed']),
  shippingAddress: z.string(),
  notes: z.string().optional(),
})

export type OrderType = z.infer<typeof OrderSchema>
