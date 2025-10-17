import { Table, Column, DataType, BelongsTo, ForeignKey, Model } from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Order, Product } from '../../models/index'

import { OrderItemType } from './order-item.types'

type OrderItemCreate = Optional<OrderItemType, 'id' | 'createdAt' | 'updatedAt'>

@Table({
  tableName: 'ecommerce_order_items',
  timestamps: true,
})
export class OrderItem extends Model<OrderItemType, OrderItemCreate> {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  declare orderId: number

  @ForeignKey(() => Product)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  declare productId: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare unitPrice: number

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare totalPrice: number

  @BelongsTo(() => Order, 'orderId')
  order?: Order

  @BelongsTo(() => Product, 'productId')
  product?: Product
}
