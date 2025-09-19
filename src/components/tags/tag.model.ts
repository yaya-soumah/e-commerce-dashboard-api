import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript'

import { ProductTag, Product } from '../../models'
import { generateSlug } from '../../utils/slag'

@Table({ tableName: 'ecommerce_tags', timestamps: true })
export class Tag extends Model<Tag> {
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

  @BelongsToMany(() => Product, () => ProductTag, 'tagId')
  products?: Product[]
}
