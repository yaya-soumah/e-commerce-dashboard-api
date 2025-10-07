import { Op } from 'sequelize'

import { InventoryRepository } from '../inventories/inventory.repository'
import { Order, Product, OrderItem } from '../../models'
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
    const subtotal = await this.calculateSubtotal(data.items)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    //avoid duplicate order number
    const orderNumber = generateOrderNumber()
    const existingOrder = await Order.findOne({ where: { orderNumber } })
    if (existingOrder !== null) {
      throw new AppError('Something went wrong. Please retry again', 400)
    }
    // create order
    const order = await Order.create({
      orderNumber,
      customerName: data.customerName,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingAddress: data.shippingAddress,
      notes: data?.notes || '',
      userId: data.userId,
    })

    //create order items and deduct stock
    const orderItems = []

    //create all order items
    for (const ItemData of data.items) {
      const product = await Product.findByPk(ItemData.productId)
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
      const orderItem = OrderItem.create({
        productId: product.id,
        orderId: order.id,
        quantity: ItemData.quantity,
        unitPrice,
        totalPrice,
      })

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

    return await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    })
  }

  //update order
  static async update(id: number, data: OrderUpdate & { userId: number }) {
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
      const items = await OrderItem.findAll({ where: { orderId: id } })
      for (const item of items) {
        await InventoryRepository.restock(
          item.productId,
          item.quantity,
          `Order ${order.orderNumber} cancelled`,
          userId,
        )
      }
    }
    await order.update(updateData)

    return Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    })
  }

  //delete
  static async delete(id: number, userId: number) {
    const order = await Order.findByPk(id)
    if (!order) {
      throw new AppError('Order not found', 404)
    }

    //soft delete: set status to cancelled
    await order.update({ status: 'cancelled' })

    //restock
    const items = await OrderItem.findAll({ where: { orderId: order.id } })
    for (const item of items) {
      await InventoryRepository.restock(
        item.productId,
        item.quantity,
        `Order ${order.orderNumber} cancelled`,
        userId,
      )
    }
  }
  //add order item
  static async addItem(data: OrderItemCreate) {
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

  private static async calculateSubtotal(items: { productId: number; quantity: number }[]) {
    let subtotal = 0
    for (const item of items) {
      const product = await Product.findByPk(item.productId)
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
