import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'

import { ProductRepository } from './product.repository'
import { ProductDataType } from './product.types'

export class ProductService {
  static async create(data: ProductDataType) {
    return await ProductRepository.create(data)
  }

  static async update(id: number, data: Partial<ProductDataType>) {
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
      tags: search.tags ? search.tags.split(',') : undefined,
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
