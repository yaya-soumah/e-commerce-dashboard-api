import z from 'zod'

export const UpdateUserSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(2).optional(),
  avatar: z.url().optional(),
})

export const ChangePasswordSchema = z.object({
  newPassword: z.string(),
  oldPassword: z.string(),
})

export const UpdateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'blocked']),
})

export const UpdateRoleSchema = z.object({
  role: z.string(),
})
