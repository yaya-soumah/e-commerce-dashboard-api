import { AppError } from '../../utils/app-error.util'
import { signRefreshToken, signAccessToken, verifyRefreshToken } from '../../utils/jwt.util'
import { compare, parse } from '../../utils/bcrypt.util'
import { UserRole } from '../users/user.model'
import { RolesRepository } from '../roles/roles.repositories'

import { AuthRepository } from './auth.repository'

export class AuthService {
  private static payload(user: any, role: any) {
    console.log('auth-service-payload:', {
      userId: user.id,
      email: user.email,
      roleName: role.name,
    })
    return { userId: user.id, email: user.email, roleName: role.name }
  }
  static async register(data: { name: string; email: string; password: string }) {
    const isEmailExist = await AuthRepository.getByEmail(data.email)
    if (isEmailExist) throw new AppError('This email already exists', 400)

    const hashedPassword = await parse(data.password)

    const role = await RolesRepository.getOrCreate('staff')
    const user = await AuthRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roleId: role.id,
    })

    const accessToken = signAccessToken(this.payload(user, role.get({ plain: true })))
    const refreshToken = signRefreshToken(this.payload(user, role.get({ plain: true })))

    return { accessToken, refreshToken, user }
  }

  static async login(data: { email: string; password: string }) {
    const user = await AuthRepository.getByEmail(data.email)

    if (!user) throw new AppError('User not found', 404)
    const match = await compare(data.password, user.getDataValue('password'))

    if (!match) throw new AppError('Wrong password', 400)
    const role = await user.$get('role')
    const accessToken = signAccessToken(
      this.payload(user.get({ plain: true }), role?.get({ plain: true })),
    )
    const refreshToken = signRefreshToken(
      this.payload(user.get({ plain: true }), role?.get({ plain: true })),
    )

    return { accessToken, refreshToken, user }
  }

  static async refresh(refreshToken: string) {
    try {
      const decode = verifyRefreshToken(refreshToken) as {
        userId: string
        email: string
        roleId: UserRole
      }
      const accessToken = signAccessToken({
        userId: decode.userId,
        email: decode.email,
        roleId: decode.roleId,
      })
      return { accessToken }
    } catch {
      throw new AppError('Invalid or expired refresh token', 400)
    }
  }

  static async getCurrentUser(id: number) {
    const user = await AuthRepository.getById(id)
    if (!user) throw new AppError('User not found', 404)
    return user
  }
}
