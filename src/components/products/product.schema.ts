import z from 'zod'

export const ProductCreate = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().gte(0, 'The price must be positive'),
  status: z.enum(['active', 'draft', 'archived']),
  stock: z.number().int().gte(0, 'The stock cannot be negative'),
  lowStockLevel: z.number().int().gte(0, 'The low stock level cannot be negative'),
  sku: z.string().optional(),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export const ProductUpdate = z.object({
  description: z.string().optional(),
  price: z.number().gte(0, 'The price must be positive').optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  stock: z.number().int().gte(0, 'The stock cannot be negative').optional(),
  lowStockLevel: z.number().int().gte(0, 'The low stock level cannot be negative').optional(),
  sku: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional().optional(),
  images: z.array(z.string()).optional(),
})

export type ProductCreateDataType = z.infer<typeof ProductCreate>
