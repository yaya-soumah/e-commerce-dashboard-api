import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { AnalyticService } from './analytic.service'
import { AnalyticsFilter } from './analytic.types'

export class AnalyticController {
  static async overviewHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = this.buildFilter(req.query)
      const overview = await AnalyticService.getOverview(filter)
      success(res, 200, {
        status: 'success',
        data: overview,
        meta: { timestamp: new Date() },
      })
    } catch (err) {
      next(err)
    }
  }

  static async salesHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = this.buildFilter(req.query)
      const sales = await AnalyticService.getSales(filter)
      success(res, 200, {
        status: 'success',
        data: sales,
        meta: { timestamp: new Date() },
      })
    } catch (err) {
      next(err)
    }
  }

  static async topProductsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = this.buildFilter(req.query)
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
      const topProducts = await AnalyticService.getTopSellingProducts(filter, limit)
      success(res, 200, {
        status: 'success',
        data: { topProducts },
        meta: { timestamp: new Date() },
      })
    } catch (err) {
      next(err)
    }
  }

  static async chartHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = this.buildFilter(req.query)
      const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day'
      const chartData = await AnalyticService.getChartData(filter, groupBy)
      success(res, 200, {
        status: 'success',
        data: { chartData, groupBy },
        meta: { timestamp: new Date() },
      })
    } catch (err) {
      next(err)
    }
  }

  static async statusHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = this.buildFilter(req.query)
      const distribution = await AnalyticService.getStatusDistribution(filter)
      success(res, 200, {
        status: 'success',
        data: { distribution },
        meta: { timestamp: new Date() },
      })
    } catch (err) {
      next(err)
    }
  }

  private static buildFilter(query: any): AnalyticsFilter {
    return {
      startDate: query.startDate as string,
      endDate: query.endDate as string,
      categoryId: query.categoryId ? parseInt(query.categoryId as string) : undefined,
    }
  }
}
