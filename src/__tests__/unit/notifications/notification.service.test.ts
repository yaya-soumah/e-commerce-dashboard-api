// src/components/notifications/__tests__/notification.service.test.ts
import { NotificationService } from '../../../components/notifications/notification.service'
import { NotificationRepository } from '../../../components/notifications/notification.repository'
import { NotificationSetting } from '../../../components/notifications/notification.setting.model'
import { TYPES } from '../../../components/notifications/notification.types'
import sequelize from '../../../config/database.config'
import { AppError } from '../../../utils/app-error.util'

jest.mock('../../../components/notifications/notification.repository')
jest.mock('../../../models', () => ({
  User: { findByPk: jest.fn() },
}))
jest.mock('../../../components/notifications/notification.setting.model', () => ({
  NotificationSetting: { findOne: jest.fn() },
}))
jest.mock('../../../config/database.config', () => ({
  transaction: jest.fn(),
}))
jest.mock('nodemailer', () => ({}))

describe('NotificationService', () => {
  const mockTransaction = { commit: jest.fn(), rollback: jest.fn() }
  const validType = TYPES[0]
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserSettings', () => {
    it('should return mapped settings', async () => {
      const fakeSettings = [
        { type: 'order', method: 'email', enabled: true },
        { type: 'promo', method: 'inApp', enabled: false },
      ]
      ;(NotificationRepository.getUserSettings as jest.Mock).mockResolvedValue(fakeSettings)

      const result = await NotificationService.getUserSettings(1)

      expect(result).toEqual(fakeSettings)
      expect(NotificationRepository.getUserSettings).toHaveBeenCalledWith(1)
    })
  })

  describe('updateSetting', () => {
    it('should update and return setting', async () => {
      const fakeSetting = { type: validType, method: 'email', enabled: true }
      ;(NotificationRepository.updateSetting as jest.Mock).mockResolvedValue(fakeSetting)

      const result = await NotificationService.updateSetting({
        userId: 1,
        type: validType,
        method: 'email',
        enabled: true,
      })

      expect(result).toEqual(fakeSetting)
    })

    it('should throw AppError for invalid type', async () => {
      await expect(
        NotificationService.updateSetting({ userId: 1, type: 'invalid' as any }),
      ).rejects.toThrow(AppError)
    })
  })

  describe('triggerNotification', () => {
    beforeEach(() => {
      ;(sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction)
    })

    it('should skip when no recipients', async () => {
      ;(NotificationRepository.getEligibleRecipients as jest.Mock).mockResolvedValue([])
      await NotificationService.triggerNotification('order' as any, 'Title')
      expect(NotificationRepository.createLog).not.toHaveBeenCalled()
    })

    it('should create logs and commit transaction', async () => {
      ;(NotificationRepository.getEligibleRecipients as jest.Mock).mockResolvedValue([1])
      ;(NotificationRepository.createLog as jest.Mock).mockResolvedValue({
        userId: 1,
        type: 'order',
      })
      ;(NotificationSetting.findOne as jest.Mock).mockResolvedValue({ method: 'inApp' })

      await NotificationService.triggerNotification('order' as any, 'Title', 'Body', 123)

      expect(NotificationRepository.createLog).toHaveBeenCalled()
      expect(mockTransaction.commit).toHaveBeenCalled()
    })

    it('should rollback transaction on error', async () => {
      ;(NotificationRepository.getEligibleRecipients as jest.Mock).mockResolvedValue([1])
      ;(NotificationRepository.createLog as jest.Mock).mockRejectedValue(new Error('DB fail'))

      await expect(
        NotificationService.triggerNotification('order' as any, 'Title', 'Body'),
      ).rejects.toThrow('DB fail')
      expect(mockTransaction.rollback).toHaveBeenCalled()
    })
  })

  describe('getUserNotifications', () => {
    it('should return mapped notifications', async () => {
      const fakeLogs = [
        { id: 1, type: 'order', title: 'New', body: 'msg', read: false, createdAt: new Date() },
      ]
      ;(NotificationRepository.getUserLogs as jest.Mock).mockResolvedValue(fakeLogs)

      const result = await NotificationService.getUserNotifications(1)
      expect(result[0]).toHaveProperty('id', 1)
      expect(NotificationRepository.getUserLogs).toHaveBeenCalledWith(1, undefined)
    })
  })

  describe('markRead', () => {
    it('should mark a log as read', async () => {
      ;(NotificationRepository.markLogRead as jest.Mock).mockResolvedValue(1)
      const result = await NotificationService.markRead(10, 1)
      expect(result).toEqual({ read: true })
    })

    it('should throw AppError if not found', async () => {
      ;(NotificationRepository.markLogRead as jest.Mock).mockResolvedValue(0)
      await expect(NotificationService.markRead(10, 1)).rejects.toThrow(AppError)
    })
  })

  describe('markAllRead', () => {
    it('should mark all logs as read', async () => {
      ;(NotificationRepository.markAllRead as jest.Mock).mockResolvedValue(2)
      const result = await NotificationService.markAllRead(1)
      expect(result).toEqual({ allRead: true })
    })

    it('should throw AppError if failed', async () => {
      ;(NotificationRepository.markAllRead as jest.Mock).mockResolvedValue(0)
      await expect(NotificationService.markAllRead(1)).rejects.toThrow(AppError)
    })
  })
})
