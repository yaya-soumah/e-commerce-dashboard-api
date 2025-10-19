import { Request, Response, NextFunction } from 'express'

import { verifyAccessToken } from '../utils/jwt.util'
import { error } from '../utils/response.util'
import { PayloadType } from '../types'
import { runWithContext } from '../utils/requestContext.util'

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  //make it async handle audit
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    error(res, 401, 'Authentication required')
  }

  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) error(res, 401, 'Authentication required')

  try {
    const decoded = verifyAccessToken(token as string) as PayloadType
    //add context for audit
    const context = { userId: decoded.userId, ipAddress: req.ip, userAgent: req.get('User-Agent') }
    //add claim to the req object
    ;(req as any).user = decoded

    return runWithContext(context, async () => next())
  } catch {
    error(res, 403, 'Forbidden: invalid or expired token.')
  }
}
