import { AuthRepository } from '../../../components/auth/auth.repository'
import { AuthService } from '../../../components/auth/auth.service'
import { RolesRepository } from '../../../components/roles/roles.repositories'
import { User, Role } from '../../../models'
import { parse } from '../../../utils/bcrypt.util'
import token from '../../utils/token'

describe('AuthService', () => {
  const userData = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roleId: 1,
    password: '',
  }

  const roleData = { id: 1, name: 'staff' } as unknown as Role

  //add get method to role object
  const existingRole = {
    ...roleData,
    get: jest.fn().mockReturnValue(roleData),
  }

  let roleGetOrCreateSpy: jest.SpyInstance
  let userCreateSpy: jest.SpyInstance
  let userGetByEmailSpy: jest.SpyInstance
  let userGetByIdSpy: jest.SpyInstance

  beforeAll(() => {
    userCreateSpy = jest.spyOn(AuthRepository, 'create').mockResolvedValue(userData)
    userGetByEmailSpy = jest.spyOn(AuthRepository, 'getByEmail').mockResolvedValue(null)
    userGetByIdSpy = jest.spyOn(AuthRepository, 'getById').mockResolvedValue(userData as User)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user', async () => {
    const data = {
      name: userData.name,
      email: userData.email,
      password: 'Password123',
    }

    roleGetOrCreateSpy = jest
      .spyOn(RolesRepository, 'getOrCreate')
      .mockResolvedValue(existingRole as unknown as Role)

    const result = await AuthService.register(data)

    expect(userGetByEmailSpy).toHaveBeenCalledWith(data.email)
    expect(roleGetOrCreateSpy).toHaveBeenCalledWith('staff')
    expect(userCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: data.name, email: data.email }),
    )
    expect(result).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: expect.objectContaining({ email: data.email }),
    })
  })

  it('should throw an error if email already exists', async () => {
    userGetByEmailSpy.mockResolvedValueOnce(userData as User)
    await expect(
      AuthService.register({ name: userData.name, email: userData.email, password: 'Password123' }),
    ).rejects.toThrow('This email already exists')
  })

  it('should login a user', async () => {
    userData.password = await parse('Password123')

    //add some sequelize methods on user objects
    const existingUser = {
      ...userData,
      $get: jest.fn().mockResolvedValue(existingRole),
      getDataValue: (key: keyof typeof userData) => userData[key],
      get: jest.fn().mockReturnValue(userData),
    }
    userGetByEmailSpy.mockResolvedValueOnce(existingUser as unknown as User)

    const result = await AuthService.login({ email: userData.email, password: 'Password123' })

    expect(userGetByEmailSpy).toHaveBeenCalledWith(userData.email)
    expect(result).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: expect.objectContaining({ email: userData.email }),
    })
  })

  it('should throw an error if user not found during login', async () => {
    userGetByEmailSpy.mockResolvedValueOnce(null)
    await expect(
      AuthService.login({ email: userData.email, password: 'Password123' }),
    ).rejects.toThrow('User not found')
  })

  it('should throw an error if password is incorrect', async () => {
    const existingUser = {
      ...userData,
      password: await parse('Invalid'),
      $get: jest.fn().mockResolvedValue(roleData),
      getDataValue: (key: keyof typeof userData) => userData[key],
    }
    userGetByEmailSpy.mockResolvedValueOnce(existingUser as unknown as User)
    await expect(
      AuthService.login({ email: userData.email, password: 'WrongPassword' }),
    ).rejects.toThrow('Wrong password')
  })

  it('should refresh access token', async () => {
    const refreshTokenValue = token(userData).refreshToken
    const result = await AuthService.refresh(refreshTokenValue)
    expect(result).toHaveProperty('accessToken')
  })

  it('should throw an error if refresh token is invalid', async () => {
    await expect(AuthService.refresh('invalid-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    )
  })

  it('should get current user by ID', async () => {
    const result = await AuthService.getCurrentUser(userData.id)
    expect(userGetByIdSpy).toHaveBeenCalledWith(userData.id)
    expect(result).toMatchObject({ email: userData.email, name: userData.name })
  })

  it('should throw an error if user not found by ID', async () => {
    userGetByIdSpy.mockResolvedValueOnce(null)
    await expect(AuthService.getCurrentUser(9999)).rejects.toThrow('User not found')
  })
})
