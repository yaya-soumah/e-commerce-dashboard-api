import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().refine((val) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(val), {
    message: 'Password must contain at least one uppercase, and one number',
  }),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
})
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
})
