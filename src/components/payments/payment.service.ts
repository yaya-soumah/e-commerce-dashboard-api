import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'
import { OrderRepository } from '../orders/order.repository'

import { PaymentCreate } from './payment.types'
import { PaymentRepository } from './payment.repository'

export class PaymentService {
  static async listPayments(query: any) {
    const {
      page,
      offset,
      limit,
      search: { dateFrom, dateTo, status, method },
    } = await parseQuery(query)

    const { rows, count } = await PaymentRepository.getPayments({
      offset,
      limit,
      dateFrom,
      dateTo,
      status,
      method,
    })
    return {
      payments: rows,
      total: count,
      page,
      offset,
      totalPage: Math.floor(count / limit),
    }
  }

  static async getPayment(id: number) {
    const payment = await PaymentRepository.getPaymentById(id)
    if (!payment) {
      throw new AppError('Payment not found', 404)
    }
    return payment
  }

  static async create(data: PaymentCreate) {
    const order = await OrderRepository.findById(data.orderId)
    if (!order) {
      throw new AppError('Order not found', 400)
    }
    if (!['unpaid', 'failed'].includes(order.paymentStatus)) {
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
    return await PaymentRepository.createPayment(data, order)
  }

  static async update(id: number, data: Partial<PaymentCreate>) {
    const existingPayment = await PaymentRepository.getPaymentById(id)

    if (!existingPayment) {
      throw new AppError('Payment not found', 404)
    }

    if (data.amount !== undefined && data.amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400)
    }

    if (existingPayment.status === 'paid' && data.amount !== undefined) {
      throw new AppError('Cannot update amount for paid payment', 400)
    }

    const updatedPayment = await PaymentRepository.updatePayment(id, data, existingPayment)
    if (!updatedPayment) {
      throw new AppError('Payment not found', 404)
    }
    return updatedPayment
  }

  static async remove(id: number) {
    await PaymentRepository.deletePayment(id)
  }
}
