import { z } from 'zod'
export const FilterSchema = z.object({
  startDate: z.iso.date({ error: 'invalid startDate format' }).pipe(z.coerce.date()).optional(),
  endDate: z.iso.date({ error: 'invalid endDate format' }).pipe(z.coerce.date()).optional(),
  categoryId: z
    .string()
    .transform((value) => parseInt(value))
    .optional(),
  limit: z
    .string()
    .transform((value) => parseInt(value))
    .optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day').optional(),
})
