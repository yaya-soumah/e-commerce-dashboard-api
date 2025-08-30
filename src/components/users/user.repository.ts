import { Op } from 'sequelize'

import { User } from '../../models/index'

type FindAllDataType = {
  isPagination?: boolean
  search?: Record<string, string>
  sort_by?: string
  order_by?: string
  limit?: number
  offset?: number
}

export class UserRepository {
  private static readonly validFields = ['name', 'email', 'createdAt', 'status']
  private static readonly validSearchFields = ['name', 'email', 'status']

  private static getOrderClause(field?: string, direction?: string) {
    if (!field) {
      return undefined
    }
    const orderField = this.validFields.includes(field ?? '') ? field! : 'createdAt'
    const orderDirection: 'ASC' | 'DESC' = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    return [[orderField, orderDirection] as [string, 'ASC' | 'DESC']]
  }

  private static getSearchClause(search?: Record<string, string>) {
    if (!search) return {}
    const where: Record<string, any> = {}
    for (const key of Object.keys(search)) {
      if (this.validSearchFields.includes(key)) {
        where[key] = { [Op.like]: `%${search[key]}%` }
      }
    }
    return where
  }

  static async findAll({
    isPagination = false,
    search,
    sort_by,
    order_by,
    limit,
    offset,
  }: FindAllDataType = {}) {
    const where = this.getSearchClause(search)
    const order = this.getOrderClause(sort_by, order_by)

    if (!isPagination) {
      return await User.findAll({ where, order })
    } else {
      return User.findAndCountAll({ where, limit, offset, order })
    }
  }

  static findById(id: number) {
    return User.findByPk(id)
  }

  static findByIdWithPassword(id: number) {
    return User.scope('addPassword').findByPk(id)
  }

  static remove(id: number) {
    return User.destroy({ where: { id } })
  }
}
