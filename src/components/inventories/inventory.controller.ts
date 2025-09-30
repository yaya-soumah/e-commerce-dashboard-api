import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { InventoryService } from './inventory.service'

export class InventoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query
      const inventories = await InventoryService.getAll(query)
      success(res, 200, inventories, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }

  static async getProductHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId
      const product = await InventoryService.getByProductId(Number(productId))
      success(res, 200, product, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }

  static async restockHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId
      const { quantity, reason } = req.body
      const userId = (req as any).user.userId
      const inventory = await InventoryService.restock({
        productId: Number(productId),
        quantity: Number(quantity),
        reason,
        userId,
      })
      success(res, 200, inventory, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }
  static async decrementStockHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId
      const { quantity, reason } = req.body
      const userId = (req as any).user.userId
      const inventory = await InventoryService.decrement({
        productId: Number(productId),
        quantity: Number(quantity),
        reason,
        userId,
      })
      success(res, 200, inventory, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }

  static async getHistoryHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query
      const userId = (req as any).user.userId
      const histories = await InventoryService.getHistories(query, Number(userId))
      success(res, 200, histories, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }
}
