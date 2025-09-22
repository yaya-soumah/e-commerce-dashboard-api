import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Product, User } from '../../../models'
interface InventoryHistoryDataType {
  id: number
  productId: number
  change: number
  raison: string
  userId: number
}
type InventoryHistoryCreateDataType = Optional<InventoryHistoryDataType, 'id'>

@Table({
  tableName: 'ecommerce_inventory_histories',
  timestamps: true,
  updatedAt: false,
})
export class InventoryHistory extends Model<
  InventoryHistoryDataType,
  InventoryHistoryCreateDataType
> {
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare change: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare raison: string

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number

  @BelongsTo(() => Product, 'productId')
  product?: Product

  @BelongsTo(() => User, 'userId')
  user?: User
}
