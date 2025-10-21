import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Product } from '../../models'

interface ProductImageDataType {
  id: number
  url: string
  productId: number
  filename: string
  path: string
}

type ProductImageCreationDataTYpe = Optional<ProductImageDataType, 'id' | 'filename' | 'path'>
@Table({ tableName: 'ecommerce_product_images', timestamps: true })
export class ProductImage extends Model<ProductImageDataType, ProductImageCreationDataTYpe> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare url: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '',
  })
  declare filename: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '',
  })
  declare path: string

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number

  @BelongsTo(() => Product, 'productId')
  product?: Product
}
