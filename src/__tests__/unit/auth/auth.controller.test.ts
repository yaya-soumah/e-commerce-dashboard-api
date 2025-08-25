import { Request, Response } from 'express'

import token from '../../utils/token'
import mockHttp from '../../utils/http'
import { AuthController } from '../../../components/auth/auth.Controller'
import { AuthService } from '../../../components/auth/auth.service'

describe('AuthController', () => {
  const user = {
    id: 1,
    name: 'admin',
    email: 'admin@example.com',
  }
  const accessToken = token(user).accessToken
  const refreshToken = token(user).refreshToken

  it('Should register a new user and return tokens', async () => {
    const registerSpy = jest
      .spyOn(AuthService, 'register')
      .mockResolvedValue({ accessToken, refreshToken, user: user as any })
    const body = { name: 'admin', email: 'admin@example.com', password: 'Password123' }
    const req = mockHttp.request({ body }) as Request
    const res = mockHttp.response() as unknown as Response

    await AuthController.registerHandler(req, res)

    expect(registerSpy).toHaveBeenCalledWith(body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, expect.any(Object))
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          token: accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      }),
    )
  })

  it('Should login user', async () => {
    const loginSpy = jest
      .spyOn(AuthService, 'login')
      .mockResolvedValue({ accessToken, refreshToken, user: user as any })
    const body = { email: 'admin@example.com', password: 'Password123' }
    const req = mockHttp.request({ body }) as Request
    const res = mockHttp.response() as unknown as Response
    await AuthController.loginHandler(req, res)

    expect(loginSpy).toHaveBeenCalledWith(body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, expect.any(Object))
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          token: accessToken,
          user: expect.objectContaining({
            id: user.id,
            name: user.name,
            email: user.email,
          }),
        },
      }),
    )
  })

  it('Should refresh token', async () => {
    const refreshSpy = jest.spyOn(AuthService, 'refresh').mockResolvedValue({ accessToken })
    const cookies = {
      refreshToken,
    }
    const req = mockHttp.request({
      cookies,
    }) as Request
    const res = mockHttp.response() as unknown as Response

    await AuthController.refreshTokenHandler(req, res)

    expect(refreshSpy).toHaveBeenCalled()
    expect(refreshSpy).toHaveBeenCalledWith(refreshToken)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          token: accessToken,
        },
      }),
    )
  })

  it('Should logout', async () => {
    const req = {} as Request
    const res = mockHttp.response() as unknown as Response
    await AuthController.logoutHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object))
  })
  it('Should get current user', async () => {
    const currentUserSpy = jest
      .spyOn(AuthService, 'getCurrentUser')
      .mockResolvedValue({ user } as any)
    const req = {} as Request
    const res = mockHttp.response() as unknown as Response
    ;(req as any).user = { userId: user.id }
    await AuthController.getCurrentUserHandler(req, res)

    expect(currentUserSpy).toHaveBeenCalled()
    expect(currentUserSpy).toHaveBeenCalledWith(user.id)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { user },
      }),
    )
  })
})
