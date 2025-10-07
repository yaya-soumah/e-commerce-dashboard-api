import { Op } from 'sequelize'

import sequelize from '../../config/database.config'
import { InventoryRepository } from '../inventories/inventory.repository'
import { Order, Product, User, OrderItem } from '../../models'
import { generateOrderNumber } from '../../utils/orderNumber'
import { AppError } from '../../utils/app-error.util'

//types
import { OrderCreate, OrderUpdate, OrderFilter } from './order.types'
import { OrderItemCreate } from './order-item.types'

export class OrderRepository {
  static async findById(id: number) {
    return await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    })
  }

  static async findAll(filter: OrderFilter) {
    const { status, dateFrom, dateTo, customerName, offset, limit } = filter
    const where: Record<string, any> = {}
    console.log('repo hits**************')
    if (status) {
      where.status = status
    }
    if (dateFrom) {
      where.createdAt = { [Op.gte]: new Date(dateFrom) }
    }
    if (dateTo) {
      //need check
      where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(dateTo) }
    }
    if (customerName) {
      where.customerName = { [Op.like]: `%${customerName}%` }
    }

    return await Order.findAndCountAll({ where, offset, limit, order: [['createdAt', 'DESC']] })
  }

  static async create(
    data: OrderCreate & {
      userId: number
    },
  ) {
    const transaction = await sequelize.transaction()
    try {
      const subtotal = await this.calculateSubtotal(data.items, transaction)
      const tax = subtotal * 0.1 // 10% tax
      const total = subtotal + tax

      //get customer by name
      const customer = await User.findOne({ where: { name: data.customerName } })
      if (!customer) throw new AppError('Customer not found', 404)

      //avoid duplicate order number
      const orderNumber = generateOrderNumber()
      const existingOrder = await Order.findOne({ where: { orderNumber } })
      if (existingOrder !== null) {
        throw new AppError('Something went wrong. Please retry again', 400)
      }
      // create order
      const order = await Order.create(
        {
          orderNumber,
          customerName: customer.id,
          subtotal,
          tax,
          total,
          status: 'pending',
          paymentStatus: 'unpaid',
          shippingAddress: data.shippingAddress,
          notes: data?.notes,
          userId: data.userId,
        },
        { transaction },
      )

      //create order items and deduct stock
      const orderItems = []

      //create all order items
      for (const ItemData of data.items) {
        const product = await Product.findByPk(ItemData.productId, { transaction })
        if (!product) {
          throw new AppError('product not found', 400)
        }
        if (product.status !== 'active') {
          throw new AppError(`Product ${ItemData.productId} not active `, 400)
        }

        // find inventory
        const inventory = await InventoryRepository.getByProductId(product.id)
        if (!inventory || inventory.stock < ItemData.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400)
        }

        const unitPrice = product.price
        const totalPrice = unitPrice * ItemData.quantity

        //create orderItem
        const orderItem = OrderItem.create(
          {
            productId: product.id,
            orderId: order.id,
            quantity: ItemData.quantity,
            unitPrice,
            totalPrice,
          },
          { transaction },
        )

        //update the stock from the inventory
        await InventoryRepository.decrement(
          product.id,
          ItemData.quantity,
          `add new order:${order.orderNumber}`,
          data.userId,
        )

        orderItems.push(orderItem)
      }
      // commit all
      transaction.commit()
      return await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      })
    } catch (err) {
      transaction.rollback()
      throw err
    }
  }

  //update order

  static async update(id: number, data: OrderUpdate & { userId: number }) {
    const transaction = await sequelize.transaction()
    try {
      const { userId, ...updateData } = data
      const order = await Order.findByPk(id)
      if (!order) {
        throw new AppError('Order not found', 400)
      }
      if (data.status && !this.isValidStatusTransition(order.status, data.status)) {
        throw new AppError('Invalid status transition', 400)
      }
      if (data.status === 'cancelled') {
        //Restore stock on cancellation
        const items = await OrderItem.findAll({ where: { orderId: id }, transaction })
        for (const item of items) {
          await InventoryRepository.restock(
            item.productId,
            item.quantity,
            `Order ${order.orderNumber} cancelled`,
            userId,
          )
        }
      }
      await order.update(updateData, { transaction })
      await transaction.commit()
      return Order.findByPk(id, {
        include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      })
    } catch (err) {
      transaction.rollback()
      throw err
    }
  }

  //delete
  static async delete(id: number, userId: number) {
    const transaction = await sequelize.transaction()
    try {
      const order = await Order.findByPk(id, { transaction })
      if (!order) {
        throw new AppError('Order not found', 404)
      }

      //soft delete: set status to cancelled
      await order.update({ status: 'cancelled' }, { transaction })

      //restock
      const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction })
      for (const item of items) {
        await InventoryRepository.restock(
          item.productId,
          item.quantity,
          `Order ${order.orderNumber} cancelled`,
          userId,
        )
      }
      await transaction.commit()
    } catch (err) {
      transaction.rollback()
      throw err
    }
  }
  //add order item
  static async createItem(data: OrderItemCreate) {
    const order = await Order.findByPk(data.orderId)
    if (!order) {
      throw new AppError('Order not found', 400)
    }
    const product = await Product.findByPk(data.productId)
    if (!product) {
      throw new AppError('Product not found', 400)
    }
    const unitPrice = product.price
    const totalPrice = unitPrice * data.quantity
    const total = 1.1 * totalPrice // 10 tax
    const item = await OrderItem.create({ ...data, unitPrice, totalPrice })

    order.$add('total', order.total + total)
    order.$add('items', item)
    order.save()
    return await Order.findByPk(data.orderId, {
      include: { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    })
  }

  private static async calculateSubtotal(
    items: { productId: number; quantity: number }[],
    transaction: any,
  ) {
    let subtotal = 0
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction })
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 400)
      }
      subtotal += product.price * item.quantity
    }
    return subtotal
  }
  private static async isValidStatusTransition(current: string, next: string) {
    const transitions = {
      pending: ['processing'],
      processing: ['shipped'],
      shipped: ['completed'],
      completed: [],
      cancelled: [],
    }
    return transitions[current as keyof typeof transitions].includes(next as never)
  }
}
