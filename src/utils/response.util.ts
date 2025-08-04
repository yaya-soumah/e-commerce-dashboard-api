import { Response } from 'express'

export const success = (
  res: Response,
  statusCode: number,
  data: any,
  message: string = 'Operation successfull',
  meta: any = {},
) => {
  if ('page' in data) {
    const { total, page, limit, totalPages, ...responseData } = data
    meta = { total, page, limit, totalPages }
    data = Object.values(responseData)[0]
  }
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
    meta,
    errors: null,
  })
}

export const error = (res: Response, statusCode: number, message: string, errors: any = {}) => {
  statusCode = statusCode || 500
  res.status(statusCode).json({
    status: 'error',
    message,
    data: null,
    meta: null,
    errors,
  })
}
