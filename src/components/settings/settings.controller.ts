import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'
import { AppError } from '../../utils/app-error.util'

import { SettingService } from './settings.service'
import { SYSTEM_SETTINGS, SettingParamsSchema } from './settings.schema'

export class SettingController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = SettingService.getAll()
      success(res, 200, settings)
    } catch (err) {
      next(err)
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = SettingParamsSchema.parse(req.params.key)
      if (!SYSTEM_SETTINGS[key as keyof typeof SYSTEM_SETTINGS])
        throw new AppError('Invalid setting key')

      const value = SettingService.get(key as keyof typeof SYSTEM_SETTINGS)
      success(res, 200, { key, value })
    } catch (err) {
      next(err)
    }
  }

  static async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = SettingParamsSchema.parse(req.params.key)
      const { value } = req.body
      const updated = await SettingService.update(key as any, value)
      success(res, 200, updated)
    } catch (err: any) {
      next(err)
    }
  }

  static async updateMany(req: Request, res: Response, next: NextFunction) {
    try {
      await SettingService.updateMany(req.body)
      success(res, 200, {}, 'Settings updated successfully')
    } catch (err: any) {
      next(err)
    }
  }
}
