import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { OrderService } from './order.service'

export class OrderController {
  static async retrieveOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const order = await OrderService.getOrder(Number(id))
      success(res, 200, order, 'Order retrieve successfully')
    } catch (err) {
      next(err)
    }
  }

  static async listOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query
      const orders = await OrderService.getAllOrders(query)

      success(res, 200, orders, 'Operation successfully')
    } catch (err) {
      next(err)
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const { userId } = (req as any).user
      const order = await OrderService.createOrder(userId, data)
      success(res, 201, order, 'Order created successfully')
    } catch (err) {
      next(err)
    }
  }

  static async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const { userId } = (req as any).user
      const data = req.body
      const order = await OrderService.updateOrder(Number(id), userId, data)

      success(res, 200, order, 'Order updated successfully')
    } catch (err) {
      next(err)
    }
  }

  static async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { userId } = (req as any).user
      await OrderService.deleteOrder(Number(id), userId)
      success(res, 200, {}, 'Order deleted successfully')
    } catch (err) {
      next(err)
    }
  }

  static async addOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const data = req.body
      const order = await OrderService.AddOrderItem({ ...data, orderId: Number(id) })
      success(res, 200, order, 'Item added successfully')
    } catch (err) {
      next(err)
    }
  }
}
