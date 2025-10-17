import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { DashboardMetricsService } from './dashboard.service'

export class DashboardMetricsController {
  static async getMetricsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DashboardMetricsService.getDashboardMetric()
      success(res, 200, result)
    } catch (error) {
      next(error)
    }
  }
}
