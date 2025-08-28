import { Op } from 'sequelize'

import { User } from '../../models/index'

export class UserController {
  static async findAll(limit?: number, offset?: number, filters?: { q?: string }) {
    const where: any = {}
    if (limit && offset) {
      where.limit = limit
      where.offset = offset
    }
    if (filters) {
      if (filters.q) {
        where.name = { [Op.iLike]: `%${filters.q}` }
      }
    }
    return limit && offset ? User.findAndCountAll(where) : User.findAll(where)
  }

  static async findById(id: number) {
    return User.findByPk(id)
  }

  static async update(id: number, data: Partial<User>) {
    return User.update(data, { where: { id }, returning: true })
  }

  static async remove(id: number) {
    return User.destroy({ where: { id } })
  }
}
