import { Request, Response, NextFunction } from 'express'

import { verifyAccessToken } from '../utils/jwt.util'
import { error } from '../utils/response.util'
import { PayloadType } from '../types'

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    error(res, 401, 'Authentication required')
  }

  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) error(res, 401, 'Authentication required')

  try {
    const decoded = verifyAccessToken(token as string) as PayloadType

    ;(req as any).user = decoded
    return next()
  } catch {
    error(res, 403, 'Forbidden: invalid or expired token.')
  }
}
