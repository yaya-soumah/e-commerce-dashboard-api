import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { AuditLogService } from './audit.logs.service'

export class AuditLogController {
  static async ListHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuditLogService.getLogs(req.query)
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }

  static async logHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuditLogService.getLogById(parseInt(req.params.id))
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }
}
