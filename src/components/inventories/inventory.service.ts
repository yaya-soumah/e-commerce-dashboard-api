import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'

import { InventoryRepository } from './inventory.repository'

interface InventoryActionParams {
  productId: number
  quantity: number
  reason: string
  userId: number
}

export class InventoryService {
  static async getByProductId(productId: number) {
    const inventory = await InventoryRepository.getByProductId(productId)
    if (!inventory) throw new AppError('Inventory not found', 404)
    return inventory
  }

  static async restock(params: InventoryActionParams) {
    return InventoryRepository.restock(
      params.productId,
      params.quantity,
      params.reason,
      params.userId,
    )
  }

  static async decrement(params: InventoryActionParams) {
    return InventoryRepository.decrement(
      params.productId,
      params.quantity,
      params.reason,
      params.userId,
    )
  }

  static async getHistories(query: any, userId: number) {
    const {
      offset,
      limit,
      page,
      search: { productId, reason },
    } = await parseQuery(query)

    const { rows, count } = await InventoryRepository.getHistories({
      productId,
      offset,
      limit,
      reason,
      userId,
    })

    return {
      inventories: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    }
  }

  static async getAll(query: any) {
    const {
      offset,
      limit,
      page,
      search: { productId, minStock, maxStock },
    } = await parseQuery(query)

    const { rows, count } = await InventoryRepository.getAll({
      productId,
      minStock,
      maxStock,
      offset,
      limit,
    })

    return {
      inventories: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    }
  }
}
