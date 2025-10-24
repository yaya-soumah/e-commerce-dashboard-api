import { Op, WhereOptions, Transaction } from 'sequelize'

import { NotificationSetting, NotificationLog, User } from '../../models'
import { NOTIFICATION_DEFAULTS } from '../../utils/env.util'

import type { NotificationLogCreateType } from './notification.types'

export class NotificationRepository {
  static async getUserSettings(userId: number): Promise<NotificationSetting[]> {
    console.log('getUserSettings called')
    return NotificationSetting.findAll({ where: { userId } })
  }

  static async updateSetting({
    userId,
    type,
    enabled = true,
    method = 'inApp',
  }: Partial<NotificationSetting>): Promise<NotificationSetting | null> {
    await NotificationSetting.update({ userId, type, enabled, method }, { where: { userId, type } })
    const updatedNotification = await NotificationSetting.findOne({ where: { userId, type } })
    return updatedNotification
  }

  static async getEligibleRecipients(type: string, eventRef?: number): Promise<number[]> {
    // Query users with enabled setting for type, based on role defaults if no setting
    const defaults = NOTIFICATION_DEFAULTS // Env parse
    const where: WhereOptions = { enabled: true, type }
    if (!defaults.includes(type)) return [] // No defaults for some

    const settings = await NotificationSetting.findAll({ where })
    const userIds = settings.map((s) => s.userId)

    // Fallback: Add users without setting but eligible by role (e.g., admin/staff for lowStock)
    // Simplified: Query users with roles
    const fallbackUsers = await User.findAll({
      where: {
        roleId: { [Op.in]: [1, 2] }, // 1=admin, 2=staff
        id: { [Op.notIn]: userIds },
      },
      attributes: ['id'],
    })
    userIds.push(...fallbackUsers.map((u) => u.id))

    // Dedup for eventRef (e.g., per-order)
    if (eventRef) {
      const existing = await NotificationLog.count({ where: { type, eventRef, read: false } })
      if (existing > 0) return [] // Skip if already sent
    }

    return [...new Set(userIds)] // Unique
  }

  static async createLog(
    data: NotificationLogCreateType,
    transaction?: Transaction,
  ): Promise<NotificationLog> {
    return NotificationLog.create(data, { transaction })
  }

  static async getUserLogs(userId: number, read?: boolean): Promise<NotificationLog[]> {
    const where: WhereOptions = { userId }
    if (read !== undefined) where.read = read
    return NotificationLog.findAll({
      where,
      include: [{ model: User, attributes: [] }], // No extra
      order: [['createdAt', 'DESC']],
    })
  }

  static async markLogRead(id: number, userId: number): Promise<number> {
    const [count] = await NotificationLog.update(
      { read: true, readAt: new Date() },
      { where: { id, userId } },
    )
    return count
  }

  static async markAllRead(userId: number): Promise<number> {
    const [count] = await NotificationLog.update(
      { read: true, readAt: new Date() },
      { where: { userId, read: false } },
    )
    return count
  }
}
