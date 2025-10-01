import { Op } from 'sequelize'

import { Product, Tag } from '../../models'

export class TagRepository {
  //retrieve a tag by id
  static async findById(id: number) {
    return Tag.findByPk(id, {
      include: [{ model: Product, as: 'products' }],
    })
  }

  //find a list of all tags
  static async findAll({ offset, limit, name }: { offset: number; limit: number; name: string }) {
    return Tag.findAndCountAll({
      where: { name: { [Op.like]: `%${name}%` } },
      include: [{ model: Product, as: 'products' }],
      limit,
      offset,
      order: [['name', 'ASC']],
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
