import { User } from '../../models/index'
import { UserCreationAttributes } from '../users/user.model'

export class AuthRepository {
  static async create(data: UserCreationAttributes) {
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
