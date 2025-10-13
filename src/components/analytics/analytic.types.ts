export interface AnalyticsFilter {
  startDate?: Date
  endDate?: Date
  categoryId?: number
  limit?: number
  groupBy?: 'day' | 'week' | 'month'
}

export interface SalesOverviewResult {
  totalRevenue: number
  ordersCount: number
  averageOrderValue: number
}
