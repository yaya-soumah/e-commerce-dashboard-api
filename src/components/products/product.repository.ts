import { Op } from 'sequelize'

import sequelize from '../../config/database.config'
import { Product, Category, Tag, ProductImage } from '../../models'

import { ProductDataType, FilterData, ProductUpdateDataType } from './product.types'

export class ProductRepository {
  // Create a product
  static async create(data: ProductDataType) {
    const transaction = await sequelize.transaction()
    try {
      const { images, tags, ...rest } = data
      const product = await Product.create(rest, { transaction })

      if (tags?.length) {
        const tagInstances = []

        for (const tagName of tags) {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName },
            transaction,
          })
          tagInstances.push(tag)
        }

        await product.$set('tags', tagInstances, { transaction })
      }

      if (images?.length) {
        const allImages = images.map((url) => ({ url, productId: product.id }))
        await ProductImage.bulkCreate(allImages, { transaction })
      }

      await transaction.commit()
      return Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: Tag, as: 'tags' },
          { model: ProductImage, as: 'images' },
        ],
      })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }

  // Update product
  static async update(id: number, data: ProductUpdateDataType) {
    const transaction = await sequelize.transaction()
    try {
      const product = await Product.findByPk(id, { transaction })
      if (!product) return null

      await product.update(data, { transaction })

      if (data.tags) {
        const tags = await Tag.findAll({
          where: { name: { [Op.in]: data.tags } },
          transaction,
        })
        await product.$set('tags', tags)
      }

      if (data.images) {
        await ProductImage.destroy({ where: { productId: product.id }, transaction })
        const images = data.images.map((url) => ({ url, productId: product.id }))
        await ProductImage.bulkCreate(images, { transaction })
      }

      await transaction.commit()
      return Product.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Tag, as: 'tags' },
          { model: ProductImage, as: 'images' },
        ],
      })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }

  // Delete a product
  static async delete(id: number) {
    return Product.destroy({ where: { id } })
  }

  // Get a product by ID
  static async getById(id: number) {
    return Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' },
        { model: ProductImage, as: 'images' },
      ],
    })
  }

  // Get list of products
  static async getAll(filter: FilterData) {
    const { name, categoryId, priceMin, priceMax, status, tags, limit = 1, offset = 0 } = filter

    const where: any = {}
    if (name) where.name = { [Op.like]: `%${name.toLowerCase()}%` }
    if (categoryId) where.categoryId = categoryId
    if (priceMin) where.price = { [Op.gte]: priceMin }
    if (priceMax) where.price = { ...(where.price || {}), [Op.lte]: priceMax }
    if (status) where.status = status

    const include: any[] = [
      { model: Category, as: 'category' },
      { model: ProductImage, as: 'images' },
    ]
    if (tags?.length) {
      include.push({
        model: Tag,
        as: 'tags',
        where: { name: { [Op.in]: tags } },
        through: { attributes: [] },
      })
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    })

    return {
      products: rows,
      total: count,
    }
  }
}
