import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'
import { parse, compare } from '../../utils/bcrypt.util'
import { RolesRepository } from '../../components/roles/roles.repositories'

import { User } from './user.model'
import { UserRepository } from './user.repository'

export class UserService {
  private static async getObject(id: number) {
    const user = await UserRepository.findById(id)
    if (!user) throw new AppError('User not found', 404)
    return user
  }
  static async getAllUsers({
    isPagination = false,
    query,
  }: { isPagination?: boolean; query?: any } = {}) {
    const { page, limit, offset, sort_by, order_by, search } = await parseQuery(query)
    let response = null

    const data = await UserRepository.findAll({
      isPagination,
      search,
      order_by,
      sort_by,
      limit,
      offset,
    })
    if (Array.isArray(data)) {
      // response with no pagination
      response = data
    } else {
      //response with pagination
      response = {
        users: data.rows,
        total: data.count,
        page,
        offset,
        totalPages: Math.ceil(data.count / limit),
      }
    }
    return response
  }

  static async getProfile(id: number) {
    const user = await this.getObject(id)
    return user
  }
  static async updateUser(id: number, data: Partial<User>) {
    const user = await this.getObject(id)
    user.update(data)
    return user
  }

  static async ChangeUserRole(id: number, role: string) {
    const user = await this.getObject(id)
    const isExistingRole = await RolesRepository.getByName(role)
    if (!isExistingRole) throw new AppError('Role not found', 404)
    user.$set('roleId', isExistingRole)
    user.save()
    return user
  }

  static async updatePassword(id: number, newPassword: string, oldPassword: string) {
    const user = await UserRepository.findByIdWithPassword(id)
    if (!user) throw new AppError('User not found', 404)
    const isValidPassword = await compare(oldPassword, user.password)
    if (!isValidPassword) throw new AppError('Invalid password')
    user.password = await parse(newPassword)
    user.save()
    return user
  }
  static async updateStatus(id: number, status: string) {
    const user = await this.getObject(id)
    user.status = status
    user.save()
    return user
  }

  static async deleteUser(id: number) {
    const rows = await UserRepository.remove(id)
    if (rows === 0) throw new AppError('User not found', 404)
    return true
  }
}
