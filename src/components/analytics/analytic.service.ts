import { AnalyticRepository } from './analytic.repository'
import { AnalyticsFilter } from './analytic.types'

export interface AnalyticsOverview {
  totalRevenue: number
  ordersCount: number
  averageOrderValue: number
  topProducts: Array<{ name: string; slug: string; price: number; totalQuantity: number }>
  salesByDay: Array<{ date: string; revenue: number; orderCount: number }>
  statusDistribution: Array<{ status: string; count: number; percentage: number }>
  paymentBreakdown: Array<{
    method: string
    count: number
    totalAmount: number
    percentage: number
  }>
}

export class AnalyticService {
  static async getOverview(filter: AnalyticsFilter): Promise<AnalyticsOverview> {
    const [overview, topProducts, salesByDay, statusDistribution, paymentBreakdown] =
      await Promise.all([
        AnalyticRepository.getSalesOverview(filter),
        AnalyticRepository.getTopSellingProducts(filter),
        AnalyticRepository.getSalesChart(filter),
        AnalyticRepository.getOrderStatusDistribution(filter),
        AnalyticRepository.getPaymentMethodBreakdown(filter),
      ])
    console.log('promises resolved')
    return {
      ...overview,
      topProducts,
      salesByDay,
      statusDistribution,
      paymentBreakdown,
    }
  }

  static async getSales(filter: AnalyticsFilter) {
    return await AnalyticRepository.getSalesOverview(filter)
  }

  static async getTopSellingProducts(filter: AnalyticsFilter) {
    return await AnalyticRepository.getTopSellingProducts(filter)
  }

  static async getChartData(filter: AnalyticsFilter) {
    return await AnalyticRepository.getSalesChart(filter)
  }

  static async getStatusDistribution(filter: AnalyticsFilter) {
    return await AnalyticRepository.getOrderStatusDistribution(filter)
  }
}
