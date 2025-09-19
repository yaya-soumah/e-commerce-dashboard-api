import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Product } from '../products/product.model'
import { generateSlug } from '../../utils/slag'

interface CategoryDataType {
  id: number
  name: string
  slug?: string
  description?: string
  parentId?: number | null
}
type CategoryCreationDataType = Optional<
  CategoryDataType,
  'id' | 'slug' | 'description' | 'parentId'
>

@Table({ tableName: 'ecommerce_categories', timestamps: true })
export class Category extends Model<CategoryDataType, CategoryCreationDataType> {
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

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare parentId?: number

  @BelongsTo(() => Category, 'parentId')
  parent?: Category

  @HasMany(() => Category, 'parentId')
  children?: Category[]

  @HasMany(() => Product, 'categoryId')
  products?: Product[]
}
