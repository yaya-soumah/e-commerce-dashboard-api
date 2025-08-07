import { User } from '../../models/index'

import { RegisterDataType } from './auth.schema'

export class AuthRepository {
  static async create(data: RegisterDataType) {
    return User.create(data)
  }

  static async getByEmail(email: string) {
    const user = await User.scope('addPassword').findOne({ where: { email } })
    if (!user) return null
    return user
  }

  static async getById(id: number) {
    const user = await User.findByPk(id)
    if (!user) return null
    return user
  }
}
