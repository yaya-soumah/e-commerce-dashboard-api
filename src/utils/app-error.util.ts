export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public errors: any

  constructor(message: string, statusCode = 500, isOperational = true, errors = {}) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}
