import { Request, Response } from 'express'

import { error, success } from '../../utils/response.util'
import { AppError } from '../../utils/app-error.util'

import { AuthService } from './auth.service'

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body
    const { accessToken, refreshToken, user } = await AuthService.register({
      email,
      password,
      role,
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 60 * 60 * 1000, // 7 days
    })
    success(res, 201, { token: accessToken, user }, 'Register successful')
  } catch (err) {
    error(res, (err as AppError).statusCode, (err as AppError).message)
  }
}

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const { accessToken, refreshToken, user } = await AuthService.login({
      email,
      password,
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 60 * 60 * 1000, // 7 days
    })
    success(res, 201, { token: accessToken, user }, 'Register successful')
  } catch (err) {
    error(res, (err as AppError).statusCode, (err as AppError).message)
  }
}

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) throw new AppError('refreshToken is required', 401)
    const { accessToken } = await AuthService.refresh(refreshToken)

    success(res, 200, { token: accessToken }, 'Token refreshed successfully')
  } catch (err) {
    error(res, (err as AppError).statusCode, (err as AppError).message)
  }
}

export const logoutHandler = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
  success(res, 200, {}, 'Logout successful')
}

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user
    const user = await AuthService.getCurrentUser(Number(userId))
    success(res, 200, user, 'Operation successful')
  } catch (err) {
    error(res, (err as AppError).statusCode, (err as AppError).message)
  }
}
