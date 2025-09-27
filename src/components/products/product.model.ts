import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  HasOne,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Category, ProductTag, ProductImage, Tag, Inventory } from '../../models'
import { generateSlug } from '../../utils/slag'

import { ProductDataType } from './product.types'

type ProductCreationDataType = Optional<ProductDataType, 'id' | 'categoryId' | 'sku' | 'slug'>

@Table({ tableName: 'ecommerce_products', timestamps: true })
export class Product extends Model<ProductDataType, ProductCreationDataType> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    set(value: string) {
      this.setDataValue('name', value)
      this.setDataValue('slug', generateSlug(value))
    },
  })
  declare name: string

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare slug: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number

  @Column({
    type: DataType.ENUM('active', 'draft', 'archived'),
    allowNull: false,
    defaultValue: 'draft',
  })
  declare status: 'active' | 'draft' | 'archived'

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare sku?: string | number

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number

  @BelongsTo(() => Category, 'categoryId')
  category?: Category

  @BelongsToMany(() => Tag, () => ProductTag, 'productId')
  tags?: Tag[]

  @HasMany(() => ProductImage, 'productId')
  images?: ProductImage[]

  @HasOne(() => Inventory, 'productId')
  inventory?: number
}
