import { AppError } from '../../utils/app-error.util'
import { signRefreshToken, signAccessToken, verifyRefreshToken } from '../../utils/jwt.util'
import { compare, parse } from '../../utils/bcrypt.util'
import { UserRole } from '../users/user.model'

import { AuthRepository } from './auth.repository'
import { RegisterDataType, LoginDataType } from './auth.schema'

export class AuthService {
  private static payload(user: any) {
    return { userId: user.id, email: user.email, role: user.role }
  }
  static async register(data: RegisterDataType) {
    const isEmailExist = await AuthRepository.getByEmail(data.email)
    if (isEmailExist) throw new AppError('This email already exists', 400)

    const hashedPassword = await parse(data.password)
    const user = await AuthRepository.create({
      email: data.email,
      password: hashedPassword,
      role: data.role,
    })

    const accessToken = signAccessToken(this.payload(user))
    const refreshToken = signRefreshToken(this.payload(user))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user.get({ plain: true })

    return { accessToken, refreshToken, user: safeUser }
  }

  static async login(data: LoginDataType) {
    const user = await AuthRepository.getByEmail(data.email)
    if (!user) throw new AppError('User not found', 404)
    const match = await compare(data.password, user.password)
    if (!match) throw new AppError('Wrong password', 400)
    const accessToken = signAccessToken(this.payload(user))
    const refreshToken = signRefreshToken(this.payload(user))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user.get({ plain: true })

    return { accessToken, refreshToken, user: safeUser }
  }

  static async refresh(refreshToken: string) {
    try {
      const decode = verifyRefreshToken(refreshToken) as {
        userId: string
        email: string
        role: UserRole
      }
      const accessToken = signAccessToken({
        userId: decode.userId,
        email: decode.email,
        role: decode.role,
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
