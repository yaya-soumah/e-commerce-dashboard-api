import { Op } from 'sequelize'

import sequelize from '../../config/database.config'
import { Inventory, InventoryHistory, Product, User } from '../../models'
import { AppError } from '../../utils/app-error.util'

import { InventoryFilter, HistoryFilterDataType } from './inventory.type'

export class InventoryRepository {
  static async getAll(filter: InventoryFilter) {
    const { productId, minStock, maxStock, offset, limit } = filter
    const where: Record<string, any> = {}
    if (productId) where.productId = productId
    if (minStock) where.stock = { [Op.gte]: minStock }
    if (maxStock) where.stock = { ...(where.stock || {}), [Op.lte]: maxStock }

    return Inventory.findAndCountAll({
      where,
      limit,
      offset,
      order: [['productId', 'ASC']],
    })
  }

  static async getByProductId(productId: number) {
    return Inventory.findOne({
      where: { productId },
      include: [{ model: Product, as: 'product' }],
    })
  }

  static async restock(productId: number, quantity: number, reason: string, userId: number) {
    const transaction = await sequelize.transaction()
    try {
      const inventoryProduct = await Inventory.findOne({ where: { productId }, transaction })
      if (!inventoryProduct) throw new AppError('Inventory not found', 404)
      const newStock = inventoryProduct.stock + quantity
      if (newStock < 0) throw new AppError('Stock cannot be negative', 400)

      await inventoryProduct.update(
        { stock: newStock, lastRestockedAt: new Date() },
        { transaction },
      )

      await InventoryHistory.create(
        { productId, change: quantity, reason, userId },
        { transaction },
      )

      await transaction.commit()
      return Inventory.findOne({
        where: { productId },
        include: [{ model: Product, as: 'product' }],
      })
    } catch (err) {
      await transaction.rollback()
      throw err instanceof AppError ? err : new AppError('Failed to restock inventory', 500)
    }
  }

  static async decrement(productId: number, quantity: number, reason: string, userId: number) {
    const transaction = await sequelize.transaction()
    try {
      const inventoryProduct = await Inventory.findOne({ where: { productId }, transaction })
      if (!inventoryProduct) throw new AppError('Inventory not found', 404)
      const newStock = inventoryProduct.stock - quantity
      if (newStock < 0) throw new AppError('Stock cannot be negative', 400)

      await inventoryProduct.update({ stock: newStock }, { transaction })

      await InventoryHistory.create(
        { productId, change: -quantity, reason, userId },
        { transaction },
      )

      await transaction.commit()
      return Inventory.findOne({
        where: { productId },
        include: [{ model: Product, as: 'product' }],
      })
    } catch (err) {
      await transaction.rollback()
      throw err instanceof AppError ? err : new AppError('Failed to restock inventory', 500)
    }
  }

  static async getHistories(filter: HistoryFilterDataType) {
    const { productId, userId, reason, offset = 0, limit = 10 } = filter
    const where: Record<string, any> = {}
    if (productId) where.productId = productId
    if (userId) where.userId = userId
    if (reason) where.reason = { [Op.like]: `%${reason.toLowerCase()}%` }

    return InventoryHistory.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Product, as: 'product' },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    })
  }
}
