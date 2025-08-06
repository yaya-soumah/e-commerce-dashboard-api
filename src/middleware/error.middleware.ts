import { Request, Response } from 'express'
import { config } from 'dotenv'

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

  logger.error(`Unexpected error: ${err}`)
  error(res, 500, 'Internal server error')
}

export default errorHandler
