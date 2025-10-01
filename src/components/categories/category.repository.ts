import { Category } from '../../models'

interface CreateData {
  name: string
  parentId?: number
  description?: string
}

export class CategoryRepository {
  // Get all categories, optionally as a tree
  static async findAll(tree = false) {
    return tree
      ? this.buildCategoryTree()
      : Category.findAll({
          include: [{ model: Category, as: 'children' }],
          order: [['name', 'ASC']],
        })
  }

  // Get category by id
  static async findById(id: number) {
    return Category.findByPk(id, {
      include: [{ model: Category, as: 'children' }],
    })
  }

  // Create a category
  static async create(data: CreateData) {
    const category = await Category.create(data)
    return this.findById(category.id)
  }

  // Update a category
  static async update(id: number, data: Partial<CreateData>) {
    await Category.update(data, { where: { id } })
    return this.findById(id)
  }

  // Delete a category
  static async delete(id: number) {
    return Category.destroy({ where: { id } })
  }

  // Build category tree
  private static async buildCategoryTree() {
    return Category.findAll({
      where: { parentId: null },
      include: [{ model: Category, as: 'children' }],
      order: [['name', 'ASC']],
    })
  }
}
