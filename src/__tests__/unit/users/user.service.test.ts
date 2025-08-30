import { UserRepository } from '../../../components/users/user.repository'
import { UserService } from '../../../components/users/user.service'
import { RolesRepository } from '../../../components/roles/roles.repositories'
import { Role, User } from '../../../models'
import * as bcryptUtil from '../../../utils/bcrypt.util'

describe('UserService', () => {
  const user = { id: 1, name: 'admin', email: 'admin@example.com' } as User
  let findAll: jest.SpiedFunction<typeof UserRepository.findAll>
  let findById: jest.SpiedFunction<typeof UserRepository.findById>
  let findByIdWithPassword: jest.SpiedFunction<typeof UserRepository.findByIdWithPassword>
  let remove: jest.SpiedFunction<typeof UserRepository.remove>

  beforeEach(() => {
    jest.clearAllMocks()
    findAll = jest.spyOn(UserRepository, 'findAll')
    findById = jest.spyOn(UserRepository, 'findById')
    findByIdWithPassword = jest.spyOn(UserRepository, 'findByIdWithPassword')
    remove = jest.spyOn(UserRepository, 'remove')
  })

  describe('getAllUsers', () => {
    it('finds all users without filter, sort and pagination', async () => {
      findAll.mockResolvedValue([user])
      const data = await UserService.getAllUsers({})
      expect(Array.isArray(data)).toBe(true)
      expect(findAll).toHaveBeenCalled()
      expect(data).toEqual([user])
    })

    it('finds all users filtered by name', async () => {
      findAll.mockResolvedValue([user])
      const data = await UserService.getAllUsers({ query: { name: 'ad' } })
      expect(Array.isArray(data)).toBe(true)
      expect(findAll).toHaveBeenCalledWith(expect.objectContaining({ search: { name: 'ad' } }))
      expect(data).toEqual([user])
    })

    it('finds all users with pagination', async () => {
      findAll.mockResolvedValue({ count: 1, rows: [user] })
      const data = await UserService.getAllUsers({ isPagination: true })
      expect(data).toMatchObject({
        users: [user],
        total: 1,
        page: 1,
        offset: 0,
        totalPages: 1,
      })
      expect(findAll).toHaveBeenCalledWith(expect.objectContaining({ isPagination: true }))
    })
  })

  describe('getProfile', () => {
    it('Should get the profile of a user by id', async () => {
      findById.mockResolvedValue(user)
      const data = await UserService.getProfile(1)
      expect(data).toHaveProperty('name', 'admin')
      expect(data).toHaveProperty('email', 'admin@example.com')
      expect(findById).toHaveBeenCalledWith(1)
    })

    it('Should throw error for invalid id', async () => {
      findById.mockResolvedValue(null)
      await expect(UserService.getProfile(999)).rejects.toThrow('User not found')
    })
  })

  describe('updateUser', () => {
    it('Should update user by id', async () => {
      const mockUpdate = jest.fn()
      findById.mockResolvedValue({ ...user, update: mockUpdate } as unknown as User)
      const data = await UserService.updateUser(1, { status: 'blocked' })
      expect(data).toBeInstanceOf(Object)
      expect(findById).toHaveBeenCalledWith(1)
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'blocked' })
    })

    it('Should throw error for invalid id', async () => {
      findById.mockResolvedValue(null)
      await expect(UserService.updateUser(999, { status: 'blocked' })).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('ChangeUserRole', () => {
    it('Should change role', async () => {
      const roleGetByNameSpy = jest
        .spyOn(RolesRepository, 'getByName')
        .mockResolvedValue({ id: 1, name: 'admin' } as Role)
      findById.mockResolvedValue({ ...user, $set: jest.fn(), save: jest.fn() } as unknown as User)
      const data = await UserService.ChangeUserRole(1, 'manager')
      expect(data).toBeDefined()
      expect(findById).toHaveBeenCalledWith(1)
      expect(roleGetByNameSpy).toHaveBeenCalledWith('manager')
    })

    it('Should throw error for invalid id', async () => {
      findById.mockResolvedValue(null)
      await expect(UserService.ChangeUserRole(999, 'manager')).rejects.toThrow('User not found')
    })

    it('Should throw error for non-existing role', async () => {
      findById.mockResolvedValue(user)
      jest.spyOn(RolesRepository, 'getByName').mockResolvedValue(null)
      await expect(UserService.ChangeUserRole(1, 'invalid')).rejects.toThrow('Role not found')
    })
  })

  describe('updatePassword', () => {
    let compareSpy: jest.SpiedFunction<typeof bcryptUtil.compare>

    beforeEach(() => {
      compareSpy = jest.spyOn(bcryptUtil, 'compare')
    })

    it('Should change a password', async () => {
      compareSpy.mockResolvedValue(true)
      findByIdWithPassword.mockResolvedValue({
        ...user,
        password: 'Password123',
        save: jest.fn(),
      } as unknown as User)
      const data = await UserService.updatePassword(1, 'new-password', 'oldPassword')
      expect(data).toBeDefined()
      expect(findByIdWithPassword).toHaveBeenCalledWith(1)
      expect(compareSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String))
    })

    it('Should throw error for invalid id', async () => {
      findByIdWithPassword.mockResolvedValue(null)
      await expect(UserService.updatePassword(999, 'new-password', 'oldPassword')).rejects.toThrow(
        'User not found',
      )
    })

    it('Should throw error for misMatched password', async () => {
      compareSpy.mockResolvedValue(false)
      findByIdWithPassword.mockResolvedValue(user)
      await expect(UserService.updatePassword(1, 'new-password', 'oldPassword')).rejects.toThrow(
        'Invalid password',
      )
    })
  })

  describe('updateStatus', () => {
    it('Should update user status', async () => {
      const mockSave = jest.fn().mockResolvedValue(true)
      findById.mockResolvedValue({
        id: 1,
        status: 'active',
        save: mockSave,
      } as unknown as User)
      const data = await UserService.updateStatus(1, 'blocked')
      expect(data).toBeDefined()
      expect(findById).toHaveBeenCalledWith(1)
      expect(mockSave).toHaveBeenCalled()
    })

    it('Should throw error for invalid id', async () => {
      findById.mockResolvedValue(null)
      await expect(UserService.updateStatus(999, 'blocked')).rejects.toThrow('User not found')
    })
  })

  describe('deleteUser', () => {
    it('Should delete user', async () => {
      remove.mockResolvedValue(1)
      const data = await UserService.deleteUser(1)
      expect(data).toBe(true)
      expect(remove).toHaveBeenCalledWith(1)
    })

    it('Should throw error for invalid id', async () => {
      remove.mockResolvedValue(0)
      await expect(UserService.deleteUser(999)).rejects.toThrow('User not found')
    })
  })
})
