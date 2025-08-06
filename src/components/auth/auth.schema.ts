import { z } from 'zod'

import { UserRole } from '../users/user.model'

export const RegisterSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .refine((val) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(val), {
      message: 'Password must contain at least one uppercase, and one number',
    }),
  role: z.enum(Object.values(UserRole)).default(UserRole.ANALYST),
})
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export type RegisterDataType = z.infer<typeof RegisterSchema>
export type LoginDataType = z.infer<typeof LoginSchema>
