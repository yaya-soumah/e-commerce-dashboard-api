import { Op, WhereOptions } from 'sequelize'

import { User, AuditLog } from '../../models'

import { AuditType, ListFilters } from './audit.logs.types'

export class AuditLogRepository {
  static async findAll(filters: ListFilters): Promise<{ rows: AuditLog[]; count: number }> {
    const { userId, action, fromDate, toDate, offset, limit } = filters

    const where: WhereOptions = {}
    if (userId) where.userId = userId
    if (action) where.action = action
    if (fromDate) where.createdAt = { ...where.createdAt, [Op.gte]: fromDate }
    if (toDate) where.createdAt = { ...where.createdAt, [Op.lte]: toDate }

    return AuditLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'roleId'] }], // Join user
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })
  }

  static async findById(id: number): Promise<AuditLog | null> {
    return AuditLog.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name', 'roleId'] }],
    })
  }

  static async create(data: Omit<AuditType, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditLog> {
    return await AuditLog.create(data)
  }
}
