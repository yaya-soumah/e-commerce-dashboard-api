import { parseQuery } from '../../utils/pagination'

import { OrderItemCreate } from './order-item.types'
import { OrderRepository } from './order.repository'
import { OrderCreate, OrderUpdate } from './order.types'

export class OrderService {
  static async getOrder(id: number) {
    return await OrderRepository.findById(id)
  }
  static async getAllOrders(query: any) {
    const {
      page,
      offset,
      limit,
      search: { status, dateFrom, dateTo, customerName },
    } = await parseQuery(query)
    const { rows, count } = await OrderRepository.findAll({
      offset,
      limit,
      status,
      dateFrom,
      dateTo,
      customerName,
    })

    return {
      orders: rows,
      page,
      limit,
      total: count,
      TotalPages: Math.floor(count / limit),
    }
  }

  static async createOrder(userId: number, data: OrderCreate) {
    return await OrderRepository.create({ userId, ...data })
  }

  static async updateOrder(id: number, userId: number, data: OrderUpdate) {
    return await OrderRepository.update(id, { ...data, userId })
  }

  static async deleteOrder(id: number, userId: number) {
    return await OrderRepository.delete(id, userId)
  }
  static async createOrderItem(data: OrderItemCreate) {
    return await OrderRepository.createItem(data)
  }
}
