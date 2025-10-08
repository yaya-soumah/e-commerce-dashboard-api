import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'

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
    return await PaymentRepository.createPayment(data)
  }

  static async update(id: number, data: Partial<PaymentCreate>) {
    const payment = await PaymentRepository.updatePayment(id, data)
    if (!payment) {
      throw new AppError('Payment not found', 404)
    }
    return payment
  }

  static async remove(id: number) {
    await PaymentRepository.deletePayment(id)
  }
}
