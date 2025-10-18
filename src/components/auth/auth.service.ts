import { AppError } from '../../utils/app-error.util'
import { signRefreshToken, signAccessToken, verifyRefreshToken } from '../../utils/jwt.util'
import { compare, parse } from '../../utils/bcrypt.util'
import { User } from '../../models'
import { RolesRepository } from '../roles/roles.repositories'
import { PayloadType } from '../../types'

import { AuthRepository } from './auth.repository'

export class AuthService {
  private static payload(user: User): PayloadType {
    const permissions: string[] = user?.role?.permissions?.map((p) => p.key) as string[]

    return {
      userId: user.id,
      role: user.role?.name as string,
      permissions,
    }
  }

  //register user
  static async register(data: { name: string; email: string; password: string }) {
    const isEmailExist = await AuthRepository.getByEmail(data.email)

    if (isEmailExist) throw new AppError('This email already exists', 400)

    const hashedPassword = await parse(data.password)

    const role = await RolesRepository.getOrCreate('staff')
    const newUser = await AuthRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roleId: role.id,
    })

    const user = await AuthRepository.getById(newUser.id)

    const claim: PayloadType = AuthService.payload(user as User)

    const accessToken = signAccessToken(claim)
    const refreshToken = signRefreshToken(claim)

    return { accessToken, refreshToken, user }
  }

  static async login(data: { email: string; password: string }) {
    const user = await AuthRepository.getByEmail(data.email)

    if (!user) throw new AppError('User not found', 404)
    const match = await compare(data.password, user.getDataValue('password'))

    if (!match) throw new AppError('Wrong password', 400)

    const claim: PayloadType = AuthService.payload(user as User)

    const accessToken = signAccessToken(claim)
    const refreshToken = signRefreshToken(claim)

    return { accessToken, refreshToken, user }
  }

  static async refresh(refreshToken: string) {
    try {
      const decode = verifyRefreshToken(refreshToken) as PayloadType
      const accessToken = signAccessToken(decode)
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
