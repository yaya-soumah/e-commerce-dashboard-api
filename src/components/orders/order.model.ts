import {
  Model,
  Table,
  Column,
  BelongsTo,
  DataType,
  HasMany,
  ForeignKey,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { User, OrderItem } from '../../models'
import { generateOrderNumber } from '../../utils/orderNumber'

import { OrderType } from './order.types'

type OrderCreate = Optional<OrderType, 'id'>

@Table({ tableName: 'ecommerce_orders', timestamps: true })
export class Order extends Model<OrderType, OrderCreate> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    set() {
      this.setDataValue('orderNumber', generateOrderNumber())
    },
  })
  declare orderNumber: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare customerName: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  declare userId: string

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare subtotal: number

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare tax: number

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare total: number

  @Column({
    type: DataType.ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled'),
    allowNull: true,
    defaultValue: 'pending',
  })
  declare status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'

  @Column({
    type: DataType.ENUM('unpaid', 'paid', 'refunded', 'failed'),
    allowNull: true,
    defaultValue: 'unpaid',
  })
  declare paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed'

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare shippingAddress: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare notes?: string

  @BelongsTo(() => User, 'userId')
  createdBy?: User

  @HasMany(() => OrderItem, 'orderId')
  items?: OrderItem[]
}
