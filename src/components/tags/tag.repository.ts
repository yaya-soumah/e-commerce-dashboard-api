import { Product, Tag } from '../../models'

export class TagRepository {
  //retrieve a tag by id
  static async findById(id: number) {
    return Tag.findByPk(id, {
      include: [{ model: Product, as: 'products' }],
    })
  }

  //find a list of all tags
  static async findAll() {
    return Tag.findAll({
      include: [{ model: Product, as: 'products' }],
    })
  }

  //create a tag
  static async create(name: string) {
    const tag = await Tag.create({ name })
    return await this.findById(tag.id)
  }

  //update a tag
  static async update(id: number, name: string) {
    await Tag.update({ name }, { where: { id } })
    return await this.findById(id)
  }
  //delete a tag
  static async delete(id: number) {
    return Tag.destroy({ where: { id } })
  }
}
