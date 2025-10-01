import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { CategoryService } from './category.service'

export class CategoryController {
  static async listHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = req.query.tree === 'tree'
      const categories = await CategoryService.getAllCategories(tree)
      success(res, 200, categories)
    } catch (err) {
      next(err)
    }
  }

  static async retrieveHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const category = await CategoryService.getCategoryById(id)
      success(res, 200, category)
    } catch (err) {
      next(err)
    }
  }

  static async createHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body)
      success(res, 201, category, 'Category created successfully')
    } catch (err) {
      next(err)
    }
  }

  static async updateHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const category = await CategoryService.updateCategory(id, req.body)
      success(res, 200, category, 'Category updated successfully')
    } catch (err) {
      next(err)
    }
  }

  static async deleteHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await CategoryService.deleteCategory(id)
      success(res, 200, {}, 'Category deleted successfully')
    } catch (err) {
      next(err)
    }
  }
}
