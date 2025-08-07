import { RequestHandler } from 'express'
import { ZodSchema } from 'zod'

import { error } from '../utils/response.util'

export const validate = (schema: ZodSchema<any>): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      error(res, 400, 'Validation failed', result.error.flatten().fieldErrors)
    }
    req.body = result.data
    next()
  }
}
