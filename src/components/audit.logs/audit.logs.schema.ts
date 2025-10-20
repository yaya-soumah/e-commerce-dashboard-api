import { z } from 'zod'

import { ACTION_VALUES } from './audit.logs.types'

export const AuditQuerySchema = z.object({
  userId: z.number().optional(),
  action: z.enum(ACTION_VALUES).optional(),
  fromDate: z.iso.date({ error: 'Invalid date format' }).pipe(z.coerce.date()).optional(),
  toDate: z.iso.date({ error: 'Invalid date format' }).pipe(z.coerce.date()),
  page: z
    .string()
    .transform((value) => Number(value))
    .optional(),
  limit: z
    .string()
    .transform((value) => Number(value))
    .optional(),
})

export const AuditParamSchema = z.object({
  id: z.string().transform((value) => Number(value)),
})
