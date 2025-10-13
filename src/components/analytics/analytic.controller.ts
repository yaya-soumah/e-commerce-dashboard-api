import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'
import { AppError } from '../../utils/app-error.util'

import { FilterSchema } from './analytic.schema'
import { AnalyticService } from './analytic.service'
import { AnalyticsFilter } from './analytic.types'

export class AnalyticController {
  static async overviewHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = AnalyticController.buildFilter(req.query)
      if (!filter) {
        throw new AppError('Invalid query', 400)
      }
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
      const filter = AnalyticController.buildFilter(req.query)
      if (!filter) {
        throw new AppError('Invalid query', 400)
      }
      const sales = await AnalyticService.getSales(filter)
      success(res, 200, sales)
    } catch (err) {
      next(err)
    }
  }

  static async topProductsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = AnalyticController.buildFilter(req.query)
      if (!filter) {
        throw new AppError('Invalid query', 400)
      }
      const topProducts = await AnalyticService.getTopSellingProducts(filter)
      success(res, 200, topProducts)
    } catch (err) {
      next(err)
    }
  }

  static async chartHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = AnalyticController.buildFilter(req.query)
      if (!filter) {
        throw new AppError('Invalid query', 400)
      }
      const chartData = await AnalyticService.getChartData(filter)
      success(res, 200, chartData)
    } catch (err) {
      next(err)
    }
  }

  static async statusHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = AnalyticController.buildFilter(req.query)
      if (!filter) {
        throw new AppError('Invalid query', 400)
      }
      const distribution = await AnalyticService.getStatusDistribution(filter)
      success(res, 200, distribution)
    } catch (err) {
      next(err)
    }
  }

  static buildFilter(query: any): AnalyticsFilter | null {
    const validQuery = FilterSchema.safeParse(query)
    if (!validQuery.success) {
      return null
    }
    return {
      startDate: validQuery.data.startDate,
      endDate: validQuery.data.endDate,
      categoryId: validQuery.data.categoryId ? validQuery.data.categoryId : undefined,
      limit: validQuery.data.limit ? validQuery.data.limit : 10,
      groupBy: validQuery.data.groupBy || 'day',
    }
  }
}
