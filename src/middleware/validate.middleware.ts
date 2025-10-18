import { RequestHandler } from 'express'
import { z, ZodSchema } from 'zod'

import { error } from '../utils/response.util'

export const validate = (schema: ZodSchema<any>): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      error(res, 400, 'Validation failed', z.flattenError(result.error))
    }
    req.body = result.data
    next()
  }
}
