import z from 'zod'

export const ProductFilter = z.object({
  name: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().positive().optional(),
})

export const ProductCreate = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().min(0, 'The price must be positive'),
  status: z.enum(['active', 'draft', 'archived']),
  stock: z.number().min(0, 'The stock cannot be negative'),
  sku: z.string().optional(),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export const ProductUpdate = z.object({
  description: z.string().optional(),
  price: z.number().min(0, 'The price must be positive').optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  stock: z.number().min(0, 'The stock cannot be negative').optional(),
  sku: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional().optional(),
  images: z.array(z.string()).optional(),
})
