import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'

import { ProductRepository } from './product.repository'
import { ProductDataType } from './product.types'

export class ProductService {
  static async verifyUniqueness(name: string | undefined, sku: string | undefined) {
    if (name) {
      const existingProduct = await ProductRepository.getByName(name)
      if (existingProduct) throw new AppError('Name must be unique', 400)
    }
    if (sku) {
      const existingProduct = await ProductRepository.getBySku(sku)
      if (existingProduct) throw new AppError('Sku must be unique', 400)
    }
  }
  static async create(data: ProductDataType) {
    const { name, sku } = data ? data : {}
    await this.verifyUniqueness(name, sku)
    return await ProductRepository.create(data)
  }

  static async update(id: number, data: Partial<ProductDataType>) {
    const { name, sku } = data ? data : {}
    await this.verifyUniqueness(name, sku)
    const product = await ProductRepository.update(id, data)
    if (!product) {
      throw new AppError('Product not found', 404)
    }
    return product
  }

  static async remove(id: number) {
    const result = await ProductRepository.delete(id)
    if (!result) {
      throw new AppError('Product not found', 404)
    }
    return result
  }

  static async getById(id: number) {
    const product = await ProductRepository.getById(id)
    if (!product) {
      throw new AppError('Product not found', 404)
    }
    return product
  }

  static async getList(query: any) {
    const { page, limit, offset, search } = await parseQuery(query)
    const filter = {
      limit,
      offset,
      ...search,
    }
    const { products, total } = await ProductRepository.getAll(filter)
    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
