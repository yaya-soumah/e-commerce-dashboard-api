import { Op } from 'sequelize'

import sequelize from '../../config/database.config'
import { Inventory, Order, OrderItem, User } from '../../models'

export class DashboardMetricsRepository {
  /**
   * Returns the start and end of the current day as Date objects.
   * These are ideal for querying a DATETIME or TIMESTAMP field like 'createdAt'.
   *
   * @static
   * @returns {{from: Date, now: Date}} An object containing:
   * - `from`: Date object for the start of today (00:00:00.000).
   * - `now`: Date object for the end of today (23:59:59.999).
   */
  static getToday(): { from: Date; now: Date } {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    return {
      from: startOfDay,
      now: endOfDay,
    }
  }

  /**
   * Calculates a range of Date objects from 'day' days ago up to the current moment.
   * The 'from' date is set to the start of that day (00:00:00.000).
   *
   * @static
   * @param {number} day The number of full days ago (e.g., 7 for one week ago).
   * @returns {{from: Date, now: Date}} An object containing:
   * - `from`: Date object for the start of the day 'day' days ago.
   * - `now`: Date object representing the current date and time.
   */
  static getDaysRange(day: number): { from: Date; now: Date } {
    const now = new Date()
    const from = new Date()

    from.setDate(now.getDate() - day)
    from.setHours(0, 0, 0, 0)

    return {
      from,
      now,
    }
  }

  /**
   * Calculates a range of Date objects from 'month' months ago up to the current moment.
   * The 'from' date is set to the start of the first day of that month (00:00:00.000).
   *
   * @static
   * @param {number} month The number of months ago (e.g., 3 for three months ago).
   * @returns {{from: Date, now: Date}} An object containing:
   * - `from`: Date object for the start of the day 'month' months ago.
   * - `now`: Date object representing the current date and time.
   */
  static getMonthsRange(month: number): { from: Date; now: Date } {
    const now = new Date()
    const from = new Date()

    from.setMonth(now.getMonth() - month)
    from.setHours(0, 0, 0, 0)

    return {
      from,
      now,
    }
  }

  static async getOrdersToday(): Promise<number> {
    const { from, now } = DashboardMetricsRepository.getToday()
    const orderCountToday = await Order.count({
      where: {
        createdAt: { [Op.between]: [from, now] },
      },
    })
    return Number(orderCountToday)
  }

  static async getSumOfPaidOrdersToday(): Promise<number> {
    const { from, now } = DashboardMetricsRepository.getToday()

    const result = await Order.findOne({
      where: {
        paymentStatus: 'paid',
        createdAt: { [Op.between]: [from, now] },
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('total')), 'totalPaid']],
      raw: true,
    })

    return (result as any)?.totalPaid ? Number((result as any).totalPaid) : 0
  }

  static async getUnfulfilledOrders(): Promise<Order[]> {
    return Order.findAll({
      where: {
        status: {
          [Op.in]: ['pending', 'processing'],
        },
      },
      raw: true,
    })
  }

  static async getLowStockCount(): Promise<number> {
    const lowStockCount = await Inventory.count({
      where: {
        lowStockLevel: { [Op.lt]: sequelize.col('stockThreshold') },
      },
    })
    return Number(lowStockCount)
  }

  static async getTopSellingProductThisWeek(): Promise<OrderItem | null> {
    const { from, now } = DashboardMetricsRepository.getDaysRange(7)
    const topProduct = await OrderItem.findOne({
      attributes: ['productId', [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']],
      include: {
        model: Order,
        required: true,
        where: {
          status: { [Op.in]: ['processing', 'shipped', 'completed'] },
        },
        attributes: [],
      },
      where: {
        createdAt: { [Op.between]: [from, now] },
      },
      group: ['productId'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      raw: true,
    })
    return topProduct
  }

  static async getNewUsersThisWeek(): Promise<User[]> {
    const { from, now } = DashboardMetricsRepository.getDaysRange(7)
    const users = await User.findAll({
      where: {
        createdAt: { [Op.between]: [from, now] },
      },
      raw: true,
    })
    return users
  }

  static async getCancellationRate(): Promise<number> {
    const { from, now } = DashboardMetricsRepository.getDaysRange(7)
    const whereClause = {
      createdAt: { [Op.between]: [from, now] },
    }
    const result = await Order.findOne({
      attributes: [
        [
          sequelize.literal(`COUNT(CASE WHEN status='cancelled' THEN 1 ELSE NULL END)`),
          'cancelledCount',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
      ],
      where: whereClause,
      raw: true,
    })
    if (!result || (result as any).totalCount === 0) {
      return 0
    }
    const cancelledCount = Number((result as any).cancelledCount)
    const totalCount = Number((result as any).totalCount || 1)
    const rate = (cancelledCount / totalCount) * 100
    return rate
  }
}
