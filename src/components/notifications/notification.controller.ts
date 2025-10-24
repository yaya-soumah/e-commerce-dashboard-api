import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { NotificationService } from './notification.service'
import {
  NotificationIdSchema,
  NotificationQuerySchema,
  NotificationUpdateParamsSchema,
} from './notification.schema'

export class NotificationController {
  private static getCurrentUserId(req: Request): number {
    const id = (req as any).userId
    return Number(id)
  }
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = NotificationController.getCurrentUserId(req)
      const { read } = NotificationQuerySchema.parse(req.query.read)
      const result = await NotificationService.getUserNotifications(userId, read)
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = NotificationController.getCurrentUserId(req)
      const { id } = NotificationIdSchema.parse(req.params.id)
      const result = await NotificationService.markRead(id, Number(userId))
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }

  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = NotificationController.getCurrentUserId(req)
      const result = await NotificationService.markAllRead(userId)
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = NotificationController.getCurrentUserId(req)
      const result = await NotificationService.getUserSettings(userId)
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }

  static async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = NotificationController.getCurrentUserId(req)
      const { type } = NotificationUpdateParamsSchema.parse(req.params.type)
      const { enabled, method } = req.body
      const result = await NotificationService.updateSetting({
        type,
        enabled,
        method,
        userId,
      })
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }
}
