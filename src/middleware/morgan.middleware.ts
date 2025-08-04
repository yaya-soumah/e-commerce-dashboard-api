import morgan from 'morgan'
import { Request, Response, NextFunction } from 'express'

const morganMiddleware = () => {
  if (process.env.NODE_ENV === 'development') {
    return morgan('dev')
  }

  return (req: Request, res: Response, next: NextFunction) => next()
}

export default morganMiddleware
