import { Request, Response, NextFunction } from 'express'

import { error } from '../utils/response.util'

export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user || !allowedRoles.includes(user.role)) {
      error(res, 403, 'Access denied: insufficient role')
    }
    next()
  }
}
