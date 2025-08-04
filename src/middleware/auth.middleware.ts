import { Request, Response, NextFunction } from 'express'

import { verifyAccessToken } from '../utils/jwt.util'
import { error } from '../utils/response.util'

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    error(res, 401, 'Access denied. No token provided.')
  }

  try {
    const decoded = verifyAccessToken(token as string)
    ;(req as any).user = decoded
    next()
  } catch {
    error(res, 403, 'Invalid or expired token.')
  }
}
