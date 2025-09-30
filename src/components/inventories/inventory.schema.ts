import { z } from 'zod'
export const InventorySchema = z.object({
  quantity: z.number(),
  reason: z.string(),
})
