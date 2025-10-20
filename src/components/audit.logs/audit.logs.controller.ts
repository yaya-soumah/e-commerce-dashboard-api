import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { AuditLogService } from './audit.logs.service'
import { AuditParamSchema, AuditQuerySchema } from './audit.logs.schema'

export class AuditLogController {
  static async ListHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const ValidatedQuery = AuditQuerySchema.safeParse(req.query)
      if (!ValidatedQuery.success) throw ValidatedQuery.error
      const result = await AuditLogService.getLogs(ValidatedQuery.data)
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }

  static async logHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const ValidatedParam = AuditParamSchema.safeParse(req.params.id)
      if (!ValidatedParam.success) throw ValidatedParam.error
      const result = await AuditLogService.getLogById(ValidatedParam.data.id)
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }
}
