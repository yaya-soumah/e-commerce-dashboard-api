import { Optional } from 'sequelize'
import { Model, Column, DataType, ForeignKey, Table, BelongsTo } from 'sequelize-typescript'

import { Order } from '../../models'
interface PaymentType {
  id: number
  orderId: number
  status: 'unpaid' | 'paid' | 'refunded' | 'failed' | 'pending'
  method: 'cash' | 'credit_card' | 'bank_transfer' | 'manual'
  paidAt: Date
  amount: number
  notes?: string
}

type PaymentTypeCreate = Optional<PaymentType, 'id'>

@Table({
  tableName: 'ecommerce_payments',
  timestamps: true,
})
export class Payment extends Model<PaymentType, PaymentTypeCreate> {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare orderId: number

  @Column({
    type: DataType.ENUM('unpaid', 'paid', 'refunded', 'failed', 'pending'),
    defaultValue: 'unpaid',
  })
  declare status: string

  @Column({
    type: DataType.ENUM('cash', 'credit_card', 'bank_transfer', 'manual'),
    defaultValue: 'cash',
  })
  declare method: string

  @Column({ type: DataType.STRING })
  declare transactionId?: string

  @Column({ type: DataType.DATE })
  declare paidAt: Date

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare amount: number

  @Column({ type: DataType.TEXT })
  declare notes?: string

  @BelongsTo(() => Order, 'orderId')
  order!: Order
}
