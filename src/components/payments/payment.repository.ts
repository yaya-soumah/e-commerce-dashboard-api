import { Op } from 'sequelize'

import { Payment, Order } from '../../models'
import { AppError } from '../../utils/app-error.util'
import sequelize from '../../config/database.config'

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

    try {
      return await Payment.findAndCountAll({
        where,
        include: [{ model: Order, as: 'Order' }],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      })
    } catch (err) {
      console.error('err:', err)
      throw new AppError('Fail to get the list', 500)
    }
  }

  static async getPaymentById(id: number) {
    try {
      return await Payment.findByPk(id, {
        include: [{ model: Order, as: 'Order' }],
      })
    } catch (err) {
      console.log('err:', err)
      throw new AppError('Fail to retrieve payment', 500)
    }
  }

  static async createPayment(data: PaymentCreate) {
    const transaction = await sequelize.transaction()
    try {
      const order = await Order.findByPk(data.orderId, { transaction })
      if (!order) {
        throw new AppError('Order not found', 400)
      }
      if (order.paymentStatus !== 'unpaid') {
        throw new AppError('Order already has a payment', 400)
      }
      if (order.status === 'cancelled') {
        throw new AppError('Cannot pay for cancelled order', 400)
      }
      if (data.amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }
      if (data.status === 'paid' && !data.paidAt) {
        throw new AppError('PaidAt is required for paid status', 400)
      }

      const payment = await Payment.create(data, { transaction })

      // Sync order paymentStatus
      await order.update(
        { paymentStatus: data.status as 'unpaid' | 'paid' | 'refunded' | 'failed' },
        { transaction },
      )

      await transaction.commit()
      return await Payment.findByPk(payment.id, {
        include: [{ model: Order, as: 'Order' }],
      })
    } catch (err) {
      console.error('err:', err)
      await transaction.rollback()
      throw new AppError('Fail to create payment', 500)
    }
  }

  static async updatePayment(id: number, data: Partial<PaymentCreate>) {
    const transaction = await sequelize.transaction()
    try {
      const payment = await Payment.findByPk(id, { transaction })
      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      if (data.amount !== undefined && data.amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      if (payment.status === 'paid' && data.amount !== undefined) {
        throw new AppError('Cannot update amount for paid payment', 400)
      }

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
        include: [{ model: Order, as: 'Order' }],
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  static async deletePayment(id: number) {
    const transaction = await sequelize.transaction()
    try {
      const payment = await Payment.findByPk(id, { transaction })
      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      const order = await Order.findByPk(payment.orderId, { transaction })
      if (order && order.status !== 'cancelled') {
        throw new AppError('Cannot delete payment for active order', 400)
      }

      await payment.destroy({ transaction })
      await order?.update({ paymentStatus: 'unpaid' }, { transaction })

      await transaction.commit()
    } catch (error) {
      console.log('err:', error)
      await transaction.rollback()
      throw new AppError('Failed to delete payment', 500)
    }
  }
}
