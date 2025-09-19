import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'

import { Product } from '../../models'

@Table({ tableName: 'ecommerce_product_images', timestamps: true })
export class ProductImage extends Model<ProductImage> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare url: string

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number

  @BelongsTo(() => Product, 'productId')
  product?: Product
}
