import { Request, Response, NextFunction } from 'express'

import { error } from '../utils/response.util'

export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    // Allow if 'owner' is specified or user's role is allowed
    if (allowedRoles.includes('owner') || (user && allowedRoles.includes(user.roleName))) {
      return next()
    }

    error(res, 403, 'Access denied: insufficient role')
  }
}
