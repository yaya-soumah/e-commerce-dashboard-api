import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { ProductService } from './product.service'

export class ProductController {
  static async createProductHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create(req.body)
      success(res, 201, product, 'Product created successfully')
    } catch (err) {
      next(err)
    }
  }

  static async updateProductHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id)
      const product = await ProductService.update(productId, req.body)
      success(res, 200, product, 'Product updated successfully')
    } catch (err) {
      next(err)
    }
  }

  static async deleteProductHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id)
      await ProductService.remove(productId)
      success(res, 204, {}, 'Product deleted successfully')
    } catch (err) {
      next(err)
    }
  }

  static async getByIdHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id)
      const product = await ProductService.getById(productId)
      success(res, 200, product, 'Product retrieved successfully')
    } catch (err) {
      next(err)
    }
  }

  static async listHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getList(req.query)
      success(res, 200, products, 'List retrieved successfully')
    } catch (err) {
      next(err)
    }
  }
}
