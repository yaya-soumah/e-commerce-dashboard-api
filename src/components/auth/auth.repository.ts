import { User } from '../../models/index'
import { UserCreationAttributes } from '../users/user.model'

export class AuthRepository {
  static async create(data: UserCreationAttributes) {
    const result = await User.create(data)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = result.get({ plain: true })
    return user
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
