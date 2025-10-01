import { AppError } from '../../utils/app-error.util'
import { Product } from '../../models'

import { CategoryRepository } from './category.repository'
import { CategoryType } from './category.types'
export class CategoryService {
  //get all categories
  static async getAllCategories(tree: false) {
    return await CategoryRepository.findAll(tree)
  }

  //get category by id
  static async getCategoryById(id: number) {
    const category = await CategoryRepository.findById(id)
    if (!category) throw new AppError('Category not found', 404)
    return category
  }

  //create a category
  static async createCategory(data: CategoryType) {
    const { parentId } = data
    //verify the existence of the parent
    if (parentId) {
      const existingParent = await CategoryRepository.findById(data.parentId as number)
      if (!existingParent) throw new AppError('Wrong Parent id', 400)
    }
    return await CategoryRepository.create(data)
  }

  // update category
  static async updateCategory(id: number, data: Partial<CategoryType>) {
    const updatedCategory = await CategoryRepository.update(id, data)
    if (!updatedCategory) throw new AppError('Category not found', 404)
    return updatedCategory
  }

  // delete category
  static async deleteCategory(id: number) {
    //do not delete a category linked to a product
    const productCount = await Product.count({ where: { categoryId: id } })
    if (productCount > 0) throw new AppError('Cannot delete category with assigned products', 400)

    const deletedCategory = await CategoryRepository.delete(id)
    if (deletedCategory === 0) throw new AppError('Category not found', 404)
    return deletedCategory
  }
}
