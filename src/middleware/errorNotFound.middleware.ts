import { Request, Response } from 'express'

import { error } from '../utils/response.util'

export function notFoundHandler(req: Request, res: Response) {
  error(res, 404, `Bad request: ${req.method} ${req.originalUrl}`)
}
