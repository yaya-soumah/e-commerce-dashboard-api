import { Request, Response, NextFunction } from 'express'

import { error } from '../utils/response.util'

export function authorizeRole(roleName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user || !user.role) {
      error(res, 401, 'Authentication required')
    }
    //see own profile
    if (roleName === 'owner') {
      return next()
    }

    if (user.role !== roleName) {
      error(res, 403, 'Forbidden: insufficient role')
    }
    return next()
  }
}
