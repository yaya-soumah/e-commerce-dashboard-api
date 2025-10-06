import { z } from 'zod'

export const CreateOrderItemSchema = z.object({
  orderId: z.number(),
  productId: z.number(),
  quantity: z.number(),
})
