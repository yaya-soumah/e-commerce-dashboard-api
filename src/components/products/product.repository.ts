import { Op } from 'sequelize'

import sequelize from '../../config/database.config'
import { Product, Category, Tag, ProductImage, Inventory } from '../../models'

import { FilterData } from './product.types'
import { ProductCreateDataType } from './product.schema'

export class ProductRepository {
  // Create a product
  static async create(data: ProductCreateDataType) {
    const transaction = await sequelize.transaction()
    try {
      const { images, tags, stock, lowStockLevel, ...rest } = data
      const product = await Product.create(rest, { transaction })
      //create inventory
      await Inventory.create(
        { productId: product.id, stock: stock || 0, lowStockLevel: lowStockLevel || 0 },
        { transaction },
      )
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
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description'] },
          { model: Tag, as: 'tags' },
          { model: ProductImage, as: 'images' },
          { model: Inventory, attributes: ['id', 'stock'] },
        ],
      })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }

  // Update product
  static async update(id: number, data: Partial<ProductCreateDataType>) {
    const transaction = await sequelize.transaction()
    try {
      const { images, tags, stock, lowStockLevel, ...rest } = data
      const product = await Product.findByPk(id, { transaction })
      if (!product) {
        await transaction.rollback()
        return null
      }

      await product.update(rest, { transaction })

      if (stock !== undefined || lowStockLevel !== undefined) {
        const inventory = await Inventory.findOne({ where: { productId: product.id }, transaction })
        if (inventory) {
          const updateData: Record<string, any> = {}
          if (stock !== undefined) updateData.stock = stock
          if (lowStockLevel !== undefined) updateData.lowStockLevel = lowStockLevel
          await inventory.update(updateData, { transaction })
        }
      }

      if (tags) {
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

      if (images) {
        await ProductImage.destroy({ where: { productId: product.id }, transaction })
        if (images.length) {
          const allImages = images.map((url) => ({ url, productId: product.id }))
          await ProductImage.bulkCreate(allImages, { transaction })
        }
      }

      await transaction.commit()
      return Product.findByPk(id, {
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description'] },
          { model: Tag, as: 'tags' },
          { model: ProductImage, as: 'images' },
          { model: Inventory, attributes: ['id', 'stock'] },
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

  // get a product by name
  static async getByName(name: string) {
    return await Product.findOne({ where: { name } })
  }

  // get a product by sku
  static async getBySku(sku: string) {
    return await Product.findOne({ where: { sku } })
  }

  // Get list of products
  static async getAll(filter: FilterData) {
    const { keyword, priceMin, priceMax, status, stock, limit = 1, offset = 0 } = filter

    let where: any = {}
    if (keyword)
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.like]: `%${keyword.toLowerCase()}%` } },
          { description: { [Op.like]: `%${keyword.toLowerCase()}%` } },
        ],
      }

    if (priceMin) where.price = { [Op.gte]: priceMin }
    if (priceMax) where.price = { ...(where.price || {}), [Op.lte]: priceMax }
    if (status) where.status = status
    if (stock) where.stock = stock

    const include: any[] = [
      { model: Category, as: 'category' },
      { model: ProductImage, as: 'images' },
    ]

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
