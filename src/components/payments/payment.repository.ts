import { Op } from 'sequelize'

import { Payment, Order } from '../../models'
import { AppError } from '../../utils/app-error.util'
import sequelize from '../../config/database.config'
import { NotificationService } from '../notifications/notification.service'

import { PaymentFilter, PaymentCreate } from './payment.types'

export class PaymentRepository {
  static async getPayments(filter: PaymentFilter) {
    const { status, method, dateFrom, dateTo, offset, limit } = filter
    const where: Record<string, any> = {}

    if (status) {
      where.status = status
    }
    if (method) {
      where.method = method
    }
    if (dateFrom) {
      where.createdAt = { [Op.gte]: new Date(dateFrom) }
    }
    if (dateTo) {
      where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(dateTo) }
    }

    return await Payment.findAndCountAll({
      where,
      include: [{ model: Order, as: 'order' }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    })
  }

  static async getPaymentById(id: number) {
    return await Payment.findByPk(id, {
      include: [{ model: Order, as: 'order' }],
    })
  }

  static async createPayment(data: PaymentCreate, order: Order) {
    const transaction = await sequelize.transaction()
    try {
      const payment = await Payment.create(data, { transaction })

      // Sync order paymentStatus
      await order.update(
        { paymentStatus: data.status as 'unpaid' | 'paid' | 'refunded' | 'failed' },
        { transaction },
      )

      await transaction.commit()
      return await Payment.findByPk(payment.id, {
        include: [{ model: Order, as: 'order' }],
      })
    } catch (err) {
      await order.update({ paymentStatus: 'failed' }, { transaction })
      await NotificationService.triggerNotification(
        'failedPayment',
        'Payment Failed',
        `Order ${order.id}`,
        order.id,
      )
      await transaction.rollback()
      throw err
    }
  }

  static async updatePayment(id: number, data: Partial<PaymentCreate>, payment: Payment) {
    const transaction = await sequelize.transaction()
    try {
      await payment.update(data, { transaction })

      // Sync order paymentStatus
      const order = await Order.findByPk(payment.orderId, { transaction })
      if (order) {
        await order.update(
          {
            paymentStatus:
              (data.status as 'unpaid' | 'paid' | 'refunded' | 'failed') ||
              (payment.status as 'unpaid' | 'paid' | 'refunded' | 'failed'),
          },
          { transaction },
        )
      }

      await transaction.commit()
      return await Payment.findByPk(id, {
        include: [{ model: Order, as: 'order' }],
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  static async deletePayment(id: number) {
    const transaction = await sequelize.transaction()
    try {
      const payment = await Payment.findByPk(id)
      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      const order = await Order.findByPk(payment.orderId)
      if (order && order.status !== 'cancelled') {
        throw new AppError('Cannot delete payment for active order', 400)
      }

      await payment.destroy({ transaction })
      await order?.update({ paymentStatus: 'unpaid' }, { transaction })

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
