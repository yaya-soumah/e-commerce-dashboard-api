import { z } from 'zod'
export const CategoryCreateSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
  parentId: z.number().optional(),
})

export const CategoryUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().optional(),
  parentId: z.number().optional(),
})
