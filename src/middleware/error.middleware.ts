import { Request, Response } from 'express'
import { config } from 'dotenv'
import { ValidationError, UniqueConstraintError } from 'sequelize'

import { error } from '../utils/response.util'
import { AppError } from '../utils/app-error.util'
import logger from '../config/logger'
config()

const errorHandler = (err: Error, req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.message)
  }

  if (err instanceof AppError) {
    const errors = err.errors

    error(res, err.statusCode, err.message, errors)
  }
  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => e.message)
    return error(res, 400, 'Validation Error', errors)
  }
  if (err instanceof UniqueConstraintError) {
    const errors = err.errors.map((e) => e.message)
    return error(res, 400, 'Duplicate Field Value Entered', errors)
  }

  logger.error(`Unexpected error: ${err}`)
  error(res, 500, 'Internal server error')
}

export default errorHandler
