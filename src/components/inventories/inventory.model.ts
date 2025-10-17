import { Table, Column, DataType, ForeignKey, BelongsTo, Model } from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Product } from '../../models'

import { InventoryDataType } from './inventory.type'

type InventoryCreateDataType = Optional<
  InventoryDataType,
  'id' | 'lowStockLevel' | 'lastRestockedAt'
>
@Table({
  tableName: 'ecommerce_inventories',
  timestamps: true,
})
export class Inventory extends Model<InventoryDataType, InventoryCreateDataType> {
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  declare stock: number

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  })
  declare lowStockLevel?: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 10,
  })
  declare stockThreshold: number

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastRestockedAt?: Date

  @BelongsTo(() => Product, 'productId')
  product?: Product
}
