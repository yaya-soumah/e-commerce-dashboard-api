import { User } from '../../../models'
import { AuthRepository } from '../../../components/auth/auth.repository'

describe('AuthRepository', () => {
  afterEach(async () => {
    User.destroy({ where: {} })
  })
  const userData = {
    email: 'test@example.com',
    password: 'Password123',
    name: 'Test User',
    roleId: 1,
  }
  it('should create a new user', async () => {
    const user = await AuthRepository.create(userData)

    expect(user).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)
    expect(user.roleId).toBe(userData.roleId)
  })

  it('should get a user by email', async () => {
    await AuthRepository.create(userData)
    const user = await AuthRepository.getByEmail(userData.email)
    expect(user).toBeDefined()
    expect(user?.email).toBe(userData.email)
  })
  it('should return null if user not found by email', async () => {
    const user = await AuthRepository.getByEmail(userData.email)
    expect(user).toBeNull()
  })

  it('should get a user by ID', async () => {
    const createdUser = await AuthRepository.create(userData)
    const user = await AuthRepository.getById(createdUser.id)
    expect(user).toBeDefined()
    expect(user?.id).toBe(createdUser.id)
  })
  it('should return null if user not found by ID', async () => {
    const user = await AuthRepository.getById(9999)
    expect(user).toBeNull()
  })
})
