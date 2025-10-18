import { Request, Response, NextFunction } from 'express'

import { error } from '../utils/response.util'

export function requirePermission(permissionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user || !user.role || !user.permissions || !Array.isArray(user.permissions)) {
      error(res, 401, 'Authentication required')
    }

    //grant full access to admin
    if (user.role === 'admin') {
      return next()
    }
    if (!user.permissions.includes(permissionName)) {
      error(res, 403, 'Forbidden: insufficient permission')
    }
    return next()
  }
}
