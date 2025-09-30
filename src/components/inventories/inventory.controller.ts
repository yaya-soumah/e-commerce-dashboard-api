import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { InventoryService } from './inventory.service'

export class InventoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    InventoryController.handleRequest(async () => InventoryService.getAll(req.query), res, next)
  }

  static async getProductHandler(req: Request, res: Response, next: NextFunction) {
    InventoryController.handleRequest(
      async () => InventoryService.getByProductId(Number(req.params.productId)),
      res,
      next,
    )
  }

  static async restockHandler(req: Request, res: Response, next: NextFunction) {
    const { quantity, reason } = req.body
    const userId = (req as any).user.userId
    InventoryController.handleRequest(
      async () =>
        InventoryService.restock({
          productId: Number(req.params.productId),
          quantity: Number(quantity),
          reason,
          userId,
        }),
      res,
      next,
    )
  }

  static async decrementStockHandler(req: Request, res: Response, next: NextFunction) {
    const { quantity, reason } = req.body
    const userId = (req as any).user.userId
    InventoryController.handleRequest(
      async () =>
        InventoryService.decrement({
          productId: Number(req.params.productId),
          quantity: Number(quantity),
          reason,
          userId,
        }),
      res,
      next,
    )
  }

  static async getHistoryHandler(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user.userId
    InventoryController.handleRequest(
      async () => InventoryService.getHistories(req.query, Number(userId)),
      res,
      next,
    )
  }

  private static async handleRequest(
    serviceCall: () => Promise<any>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await serviceCall()
      success(res, 200, result, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }
}
