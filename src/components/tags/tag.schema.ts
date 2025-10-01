import { z } from 'zod'
export const TagSchema = z.object({
  name: z.string().max(20),
})
