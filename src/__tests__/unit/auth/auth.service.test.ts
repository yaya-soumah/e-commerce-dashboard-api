import { AuthRepository } from '../../../components/auth/auth.repository'
import { AuthService } from '../../../components/auth/auth.service'
import { RolesRepository } from '../../../components/roles/roles.repositories'
import { User, Role } from '../../../models'
import { parse } from '../../../utils/bcrypt.util'
import token from '../../utils/token'
// import { signRefreshToken } from '../../../utils/jwt.util'
describe('AuthService', () => {
  const userData = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roleId: 1,
  }
  const roleData = {
    id: 1,
    name: 'staff',
  } as Role
  let roleGetOrCreateSpy: unknown
  let userCreateSpy: unknown
  let userGetByEmailSpy: unknown
  let userGetByIdSpy: unknown
  beforeAll(async () => {
    roleGetOrCreateSpy = jest.spyOn(RolesRepository, 'getOrCreate').mockResolvedValue(roleData)
    userCreateSpy = jest.spyOn(AuthRepository, 'create').mockResolvedValue(userData)
    userGetByEmailSpy = jest.spyOn(AuthRepository, 'getByEmail').mockResolvedValue(null)
    userGetByIdSpy = jest.spyOn(AuthRepository, 'getById').mockResolvedValue(userData as User)
  })

  it('should create a new user', async () => {
    const data = {
      name: (userData as User).name as string,
      email: userData.email,
      password: 'Password123',
    }
    const result = await AuthService.register(data)

    expect(userGetByEmailSpy).toHaveBeenCalled()
    expect(userGetByEmailSpy).toHaveBeenCalledWith(data.email)
    expect(roleGetOrCreateSpy).toHaveBeenCalled()
    expect(roleGetOrCreateSpy).toHaveBeenCalledWith('staff')
    expect(userCreateSpy).toHaveBeenCalled()
    expect(userCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: data.name,
        email: data.email,
      }),
    )
    expect(result).toBeDefined()
    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
    expect(result).toHaveProperty('user')
    expect(AuthRepository.create).toHaveBeenCalled()
  })
  it('should throw an error if email already exists', async () => {
    jest.spyOn(AuthRepository, 'getByEmail').mockResolvedValue(userData as User)
    await expect(
      AuthService.register({
        name: userData.name as string,
        email: userData.email,
        password: 'Password123',
      }),
    ).rejects.toThrow('This email already exists')
  })
  it('should login a user', async () => {
    const existingUser = {
      ...userData,
      password: await parse('Password123'),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      $get: (role: string) => jest.fn().mockResolvedValue(roleData),
    }
    userGetByEmailSpy = jest
      .spyOn(AuthRepository, 'getByEmail')
      .mockResolvedValue(existingUser as unknown as User)

    const result = await AuthService.login({
      email: userData.email,
      password: 'Password123',
    })

    expect(userGetByEmailSpy).toHaveBeenCalled()
    expect(userGetByEmailSpy).toHaveBeenCalledWith(existingUser.email)
    expect(result).toBeDefined()
    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
    expect(result).toHaveProperty('user')
    expect(result.user.email).toBe(userData.email)
  })
  it('should throw an error if user not found during login', async () => {
    jest.spyOn(AuthRepository, 'getByEmail').mockResolvedValue(null)
    await expect(
      AuthService.login({
        email: userData.email,
        password: 'Password123',
      }),
    ).rejects.toThrow('User not found')
  })
  it('should throw an error if password is incorrect', async () => {
    const existingUser = {
      ...userData,
      password: await parse('Invalid'),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      $get: (role: string) => jest.fn().mockResolvedValue(roleData),
    }
    jest.spyOn(AuthRepository, 'getByEmail').mockResolvedValue(existingUser as unknown as User)
    await expect(
      AuthService.login({
        email: userData.email,
        password: 'WrongPassword',
      }),
    ).rejects.toThrow('Wrong password')
  })
  it('should refresh access token', async () => {
    const refreshToken = token(userData).refreshToken
    const result = await AuthService.refresh(refreshToken)
    expect(result).toBeDefined()
    expect(result).toHaveProperty('accessToken')
  })
  it('should throw an error if refresh token is invalid', async () => {
    await expect(AuthService.refresh('invalid-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    )
  })
  it('should get current user by ID', async () => {
    const result = await AuthService.getCurrentUser(userData.id)
    expect(userGetByIdSpy).toHaveBeenCalled()
    expect(userGetByIdSpy).toHaveBeenCalledWith(userData.id)
    expect(result).toBeDefined()
    expect(result.email).toBe(userData.email)
    expect(result.name).toBe(userData.name)
  })
  it('should throw an error if user not found by ID', async () => {
    jest.spyOn(AuthRepository, 'getById').mockResolvedValue(null)
    await expect(AuthService.getCurrentUser(9999)).rejects.toThrow('User not found')
  })
})
