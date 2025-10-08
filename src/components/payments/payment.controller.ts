import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { PaymentService } from './payment.service'

export class PaymentController {
  static async listHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query
      const result = await PaymentService.listPayments(query)
      success(res, 200, result, 'Payments list retrieved successful', { timestamp: new Date() })
    } catch (err) {
      next(err)
    }
  }

  static async getHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getPayment(Number(req.params.id))
      success(res, 200, payment, 'Payment retrieved successfully', { timestamp: new Date() })
    } catch (err) {
      next(err)
    }
  }

  static async createHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.create({
        orderId: Number(req.params.orderId),
        status: req.body.status,
        method: req.body.method,
        transactionId: req.body.transactionId,
        paidAt: req.body.paidAt,
        amount: req.body.amount,
        notes: req.body.notes,
      })
      success(res, 201, payment, 'Payment created successfully', { timestamp: new Date() })
    } catch (err) {
      next(err)
    }
  }

  static async updateHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.update(Number(req.params.id), req.body)
      success(res, 200, payment, 'Payment updated successfully', { timestamp: new Date() })
    } catch (err) {
      next(err)
    }
  }

  static async deleteHandler(req: Request, res: Response, next: NextFunction) {
    try {
      await PaymentService.remove(Number(req.params.id))
      success(res, 200, {}, 'Payment deleted successfully', { timestamp: new Date() })
    } catch (err) {
      next(err)
    }
  }
}
