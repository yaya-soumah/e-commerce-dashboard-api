import z from 'zod'

import { TYPES, METHODS } from './notification.types'

export const NotificationQuerySchema = z.object({
  read: z.string().pipe(z.coerce.boolean()),
})

export const NotificationIdSchema = z.object({
  id: z.string().pipe(z.coerce.number()),
})

export const NotificationUpdateParamsSchema = z.object({
  type: z.enum(TYPES),
})

export const NotificationUpdateBodySchema = z.object({
  enabled: z.boolean(),
  method: z.enum(METHODS),
})
