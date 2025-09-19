import { Table, Column, ForeignKey, DataType, Model, AllowNull } from 'sequelize-typescript'

import { Tag, Product } from '../../models'

@Table({ tableName: 'ecommerce_product_tags' })
export class ProductTag extends Model {
  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare productId: number

  @ForeignKey(() => Tag)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare tagId: number
}
