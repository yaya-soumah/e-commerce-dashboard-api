import { Request, Response } from 'express'
import { config } from 'dotenv'

import { error } from '../utils/response.util'
import { AppError } from '../utils/app-error.util'
import logger from '../config/logger'
config()

const errorHandler = (err: AppError, req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.message)
  }

  const errors = err.errors

  error(res, 500, 'Something went wrong', errors)
}

export default errorHandler
