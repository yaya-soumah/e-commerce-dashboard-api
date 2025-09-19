import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { ProductTag, Product } from '../../models'
import { generateSlug } from '../../utils/slag'

interface TagDataType {
  id: number
  name: string
  slug: string
}

type TagCreationDataType = Optional<TagDataType, 'id'>

@Table({ tableName: 'ecommerce_tags', timestamps: true })
export class Tag extends Model<TagDataType, TagCreationDataType> {
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
