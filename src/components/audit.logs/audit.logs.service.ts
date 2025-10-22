import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'
import { auditStorage } from '../../utils/requestContext.util'

import { AuditLogRepository } from './audit.logs.repository'
import { LogActionPayload } from './audit.logs.types'

export class AuditLogService {
  static async logAction(payload: LogActionPayload): Promise<void> {
    const store = auditStorage.getStore() // Context fallback

    await AuditLogRepository.create({
      ...payload,
      userId: store ? store.userId : payload.userId,
      ipAddress: store ? store.ipAddress : payload.ipAddress,
      userAgent: store ? store.userAgent : payload.userAgent,
    })
  }

  static async getLogs(query: any): Promise<any> {
    const {
      limit,
      page,
      offset,
      search: { userId, action, fromDate, toDate },
    } = await parseQuery(query)

    // Validate dates
    if (fromDate && isNaN(fromDate.getTime())) throw new AppError('Invalid fromDate', 400)
    if (toDate && isNaN(toDate.getTime())) throw new AppError('Invalid toDate', 400)
    if (fromDate && toDate && fromDate > toDate) throw new AppError('fromDate after toDate', 400)

    const { rows, count } = await AuditLogRepository.findAll({
      limit,
      offset,
      userId,
      action,
      fromDate,
      toDate,
    })
    return {
      logs: rows.map((log) => ({
        ...log,
        user: log.user || { id: null, name: 'Deleted User', roleId: null },
      })),
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    }
  }

  static async getLogById(id: number): Promise<any> {
    const log = await AuditLogRepository.findById(id)
    if (!log) throw new AppError('Log not found', 404)
    return {
      ...log,
      user: log.user || { id: null, name: 'Deleted User', roleId: null },
    }
  }
}
