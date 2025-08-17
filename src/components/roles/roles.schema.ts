import { z } from 'zod'

export const CreateRoleSchema = z.object({
  name: z.string().min(3).max(50),
})
export const UpdateRoleSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  permissions: z.array(z.number()).optional(),
})
