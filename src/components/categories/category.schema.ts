import { z } from 'zod'
export const CategoryCreateSchema = z.object({
  name: z.string().min(3).max(50),
  describe: z.string().optional(),
  parentId: z.number().optional(),
})

export const CategoryUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  describe: z.string().optional(),
  parentId: z.number().optional(),
})
