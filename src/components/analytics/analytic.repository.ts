import { Op, fn, col, Includeable, WhereOptions } from 'sequelize'

import { Order, OrderItem, Product, Payment } from '../../models'

import { AnalyticsFilter, SalesOverviewResult } from './analytic.types'

export class AnalyticRepository {
  private static readonly DEFAULT_DAYS = 30 //one month

  private static getOrderWhereClause(filter: AnalyticsFilter): WhereOptions {
    const { startDate, endDate } = filter
    const defaultStart = new Date(Date.now() - this.DEFAULT_DAYS * 24 * 60 * 60 * 1000)

    return {
      paymentStatus: 'paid', // Assuming this is correct for an "Order"
      createdAt: {
        [Op.gte]: startDate ? new Date(startDate) : defaultStart,
        [Op.lte]: endDate ? new Date(endDate) : new Date(),
      },
    }
  }

  private static getCategoryIncludeClause(categoryId?: number): Includeable[] {
    if (!categoryId) {
      return []
    }
    return [
      {
        model: OrderItem,
        as: 'items',
        required: true, // INNER JOIN: only include Orders that have items matching the filter
        include: [
          {
            model: Product,
            where: { categoryId },
            required: true, // INNER JOIN: only include OrderItems that match the Product category
          },
        ],
      },
    ]
  }

  static async getSalesOverview(filter: AnalyticsFilter): Promise<SalesOverviewResult> {
    const where = this.getOrderWhereClause(filter)
    const include = this.getCategoryIncludeClause(filter.categoryId)

    const [row] = await Order.findAll({
      where,
      include,
      attributes: [
        [fn('SUM', col('total')), 'totalRevenue'],
        [fn('COUNT', col('id')), 'ordersCount'],
        [fn('AVG', col('total')), 'averageOrderValue'],
      ],
      raw: true,
    })

    if (!row) {
      return { totalRevenue: 0, ordersCount: 0, averageOrderValue: 0 }
    }

    const result = row as unknown as {
      totalRevenue: string | null
      ordersCount: string | null
      averageOrderValue: string | null
    }

    return {
      totalRevenue: parseFloat(result.totalRevenue || '0'),
      ordersCount: parseInt(result.ordersCount || '0', 10),
      averageOrderValue: parseFloat(result.averageOrderValue || '0'),
    }
  }

  static async getTopSellingProducts(filter: AnalyticsFilter, limit = 10) {
    const orderWhere = this.getOrderWhereClause(filter)

    const includes: Includeable[] = [
      {
        model: Order,
        where: orderWhere,
        required: true,
      },
    ]

    if (filter.categoryId) {
      includes.push({
        model: Product,
        where: { categoryId: filter.categoryId },
        as: 'product',
        required: true,
      })
    }

    const topProducts = await OrderItem.findAll({
      include: includes,
      attributes: [
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [col('product.name'), 'name'],
        [col('product.slug'), 'slug'],
        [col('product.price'), 'price'],
      ],
      group: ['product.id', 'product.name', 'product.slug', 'product.price'],
      order: [[fn('SUM', col('quantity')), 'DESC']],
      limit,
      raw: true,
    })

    return topProducts.map((p: any) => ({
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.price || '0'),
      totalQuantity: parseInt(p.totalQuantity || '0', 10),
    }))
  }

  static async getSalesChart(filter: AnalyticsFilter, groupBy: 'day' | 'week' | 'month' = 'day') {
    const where = this.getOrderWhereClause(filter)
    const DATE_ALIAS = 'reportDate'
    const groupFunc = fn('date_trunc', groupBy, col('createdAt'))
    const groupClause = [groupFunc]

    const chartData = await Order.findAll({
      where,
      attributes: [
        [fn('SUM', col('total')), 'revenue'],
        [fn('COUNT', col('id')), 'orderCount'],
        [groupFunc, DATE_ALIAS],
      ],
      group: groupClause,
      order: [[groupFunc, 'ASC']],
      raw: true,
    })

    return chartData.map((row: any) => ({
      date: row[DATE_ALIAS],
      revenue: parseFloat(row.revenue || '0'),
      orderCount: parseInt(row.orderCount || '0', 10),
    }))
  }

  static async getOrderStatusDistribution(filter: AnalyticsFilter) {
    const { startDate, endDate } = filter
    const where: any = {
      paymentStatus: 'paid',
      createdAt: {
        [Op.gte]: startDate
          ? new Date(startDate)
          : new Date(Date.now() - this.DEFAULT_DAYS * 24 * 60 * 60 * 1000),
        [Op.lte]: endDate ? new Date(endDate) : new Date(),
      },
    }

    const distribution = await Order.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    })

    const total = distribution.reduce((sum, row: any) => sum + parseInt(row.count), 0)
    return distribution.map((row: any) => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: (total > 0 ? ((parseInt(row.count) / total) * 100).toFixed(2) : 0) as number,
    }))
  }

  static async getPaymentMethodBreakdown(filter: AnalyticsFilter) {
    const { startDate, endDate } = filter
    const where: any = {
      status: 'paid',
      createdAt: {
        [Op.gte]: startDate
          ? new Date(startDate)
          : new Date(Date.now() - this.DEFAULT_DAYS * 24 * 60 * 60 * 1000),
        [Op.lte]: endDate ? new Date(endDate) : new Date(),
      },
    }

    const breakdown = await Payment.findAll({
      where,
      attributes: [
        'method',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      group: ['method'],
      raw: true,
    })

    const totalAmount = breakdown.reduce((sum, row: any) => sum + parseFloat(row.totalAmount), 0)
    return breakdown.map((row: any) => ({
      method: row.method,
      count: parseInt(row.count),
      totalAmount: parseFloat(row.totalAmount),
      percentage: (totalAmount > 0
        ? ((parseFloat(row.totalAmount) / totalAmount) * 100).toFixed(2)
        : 0) as number,
    }))
  }
}
