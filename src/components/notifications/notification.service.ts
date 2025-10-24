import nodemailer from 'nodemailer'

import { AppError } from '../../utils/app-error.util'
import sequelize from '../../config/database.config'
import { User } from '../../models'

import { NotificationRepository } from './notification.repository'
import { TYPES, METHODS } from './notification.types'
import { NotificationSetting } from './notification.setting.model'
import type { NotificationType } from './notification.types'

export class NotificationService {
  // Expose transporter so it can be mocked in tests
  static transporter = nodemailer

  static async getUserSettings(userId: number) {
    const settings = await NotificationRepository.getUserSettings(userId)
    return settings.map((s) => ({
      type: s.type,
      method: s.method,
      enabled: s.enabled,
    }))
  }

  static async updateSetting({ userId, type, enabled = true, method = 'inApp' }: any) {
    if (!TYPES.includes(type!)) throw new AppError('Invalid notification type', 400)
    if (method && !METHODS.includes(method)) throw new AppError('Invalid method', 400)

    const setting = await NotificationRepository.updateSetting({ userId, type, enabled, method })
    if (!setting) throw new AppError('Fail to update setting', 400)

    return { type: setting.type, method: setting.method, enabled: setting.enabled }
  }

  static async triggerNotification(
    type: NotificationType,
    title: string,
    body?: string,
    eventRef?: number,
    userIds?: number[],
  ) {
    userIds = userIds || (await NotificationRepository.getEligibleRecipients(type, eventRef))
    if (userIds.length === 0) return

    const transaction = await sequelize.transaction()

    try {
      const logs = await Promise.all(
        userIds.map((userId) =>
          NotificationRepository.createLog(
            { userId, type, title, body, eventRef, read: false },
            transaction,
          ),
        ),
      )

      for (const log of logs) {
        const setting = (await NotificationSetting.findOne({
          where: { userId: log.userId, type },
        })) || { method: 'inApp' }

        if (setting.method === 'email' && NotificationService.transporter) {
          await NotificationService.sendEmail(log.userId, title, body || '')
        }
      }

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }

  static async sendEmail(userId: number, title: string, body: string) {
    const user = await User.findByPk(userId, { attributes: ['email'] })
    if (!user?.email) return
    console.log(`Email sent to ${user.email}: ${title} - ${body}`)
  }

  static async getUserNotifications(userId: number, read?: boolean) {
    const logs = await NotificationRepository.getUserLogs(userId, read)
    return logs.map((log) => ({
      id: log.id,
      type: log.type,
      title: log.title,
      body: log.body,
      read: log.read,
      createdAt: log.createdAt,
    }))
  }

  static async markRead(id: number, userId: number) {
    const count = await NotificationRepository.markLogRead(id, userId)
    if (count === 0) throw new AppError('Notification not found', 404)
    return { read: true }
  }

  static async markAllRead(userId: number) {
    const count = await NotificationRepository.markAllRead(userId)
    if (count === 0) throw new AppError('Operation failed', 400)
    return { allRead: true }
  }
}
