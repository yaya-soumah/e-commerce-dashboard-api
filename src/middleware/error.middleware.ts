import { NextFunction, Request, Response } from 'express'
import { ValidationError, UniqueConstraintError } from 'sequelize'

import { error } from '../utils/response.util'
import { AppError } from '../utils/app-error.util'
import logger from '../config/logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)

  if (err instanceof AppError) {
    error(res, err.statusCode, err.message, err.errors)
  }

  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => e.message)
    error(res, 400, 'Validation Error', errors)
  }

  if (err instanceof UniqueConstraintError) {
    const errors = err.errors.map((e) => e.message)
    error(res, 400, 'Duplicate Field Value Entered', errors)
  }

  logger.error(`Unexpected error: ${err}`)
  error(res, 500, 'Internal server error')
}

export default errorHandler
