import { DashboardMetricsRepository } from './dashboard.repository'

export class DashboardMetricsService {
  static async getDashboardMetric() {
    const ordersToday = await DashboardMetricsRepository.getOrdersToday()
    const revenueToday = await DashboardMetricsRepository.getSumOfPaidOrdersToday()
    const unfulfilledOrders = await DashboardMetricsRepository.getUnfulfilledOrders()
    const lowStockCount = await DashboardMetricsRepository.getLowStockCount()
    const topProductThisWeek = await DashboardMetricsRepository.getTopSellingProductThisWeek()
    const newUsersThisWeek = await DashboardMetricsRepository.getNewUsersThisWeek()
    const cancellationRate = await DashboardMetricsRepository.getCancellationRate()

    return {
      ordersToday,
      revenueToday,
      unfulfilledOrders,
      lowStockCount,
      topProductThisWeek,
      newUsersThisWeek,
      cancellationRate,
    }
  }
}
