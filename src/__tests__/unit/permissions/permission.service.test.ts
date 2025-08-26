import { PermissionsService } from '../../../components/permissions/permissions.service'
import { PermissionsRepository } from '../../../components/permissions/permissions.repository'
import { Permission } from '../../../models'

describe('Permission service', () => {
  const permissionData = {
    id: 1,
    key: 'user:create',
    description: 'Create users',
    update(data: { key: string; description: string }) {
      this.key = data.key || this.key
      this.description = data.description || this.description
    },
    save() {
      return jest.fn()
    },
  }

  let findAllSpy = jest
    .spyOn(PermissionsRepository, 'findAll')
    .mockResolvedValue([permissionData] as unknown as [Permission])
  let findByIdSpy = jest
    .spyOn(PermissionsRepository, 'findById')
    .mockResolvedValue(permissionData as unknown as Permission)
  let findByKeySpy = jest
    .spyOn(PermissionsRepository, 'findByKey')
    .mockResolvedValue(permissionData as unknown as Permission)
  let createSpy = jest
    .spyOn(PermissionsRepository, 'create')
    .mockResolvedValue(permissionData as unknown as Permission)

  describe('Get all permission', () => {
    it('Should get all permission', async () => {
      await PermissionsService.getAllPermissions()

      expect(findAllSpy).toHaveBeenCalled()
    })
  })

  describe('Get Permission by id', () => {
    it('should get permission by id', async () => {
      await PermissionsService.getPermissionById(1)

      expect(findByIdSpy).toHaveBeenCalled()
      expect(findByIdSpy).toHaveBeenCalledWith(1)
    })
    it('should throw error for invalid id', async () => {
      findByIdSpy = jest.spyOn(PermissionsRepository, 'findById').mockResolvedValue(null)
      await expect(PermissionsService.getPermissionById(1)).rejects.toThrow('Permission not found')

      expect(findByIdSpy).toHaveBeenCalled()
      expect(findByIdSpy).toHaveBeenCalledWith(1)
    })
  })
  describe('Create permission', () => {
    it('Should create a permission', async () => {
      findByKeySpy = jest.spyOn(PermissionsRepository, 'findByKey').mockResolvedValue(null)
      const permission = await PermissionsService.createPermission({
        key: 'user:create',
        description: 'Create users',
      })

      expect(findByKeySpy).toHaveBeenCalled()
      expect(findByKeySpy).toHaveBeenCalledWith('user:create')
      expect(createSpy).toHaveBeenCalled()
      expect(createSpy).toHaveBeenCalledWith({ key: 'user:create', description: 'Create users' })
      expect(permission).toBeDefined()
    })
    it('Should throw error for existing permission', async () => {
      findByKeySpy = jest
        .spyOn(PermissionsRepository, 'findByKey')
        .mockResolvedValue(permissionData as unknown as Permission)
      await expect(
        PermissionsService.createPermission({ key: 'user:create', description: 'Create users' }),
      ).rejects.toThrow('Permission with this key already exists')

      expect(findByKeySpy).toHaveBeenCalled()
      expect(findByKeySpy).toHaveBeenCalledWith('user:create')
    })
  })

  describe('Update permission', () => {
    it('Should update a permission', async () => {
      findByIdSpy = jest
        .spyOn(PermissionsRepository, 'findById')
        .mockResolvedValue(permissionData as unknown as Permission)
      const permission = await PermissionsService.updatePermission(1, {
        key: 'user:delete',
        description: 'Delete users',
      })
      expect(findByIdSpy).toHaveBeenCalled()
      expect(findByIdSpy).toHaveBeenCalledWith(1)
      expect(findByKeySpy).toHaveBeenCalled()
      expect(findByKeySpy).toHaveBeenCalledWith('user:delete')
      expect(permission).toBeDefined()
      expect(permission.key).toBe('user:delete')
    })
    it('Should throw error for invalid id', async () => {
      findByIdSpy = jest.spyOn(PermissionsRepository, 'findById').mockResolvedValue(null)

      await expect(
        PermissionsService.updatePermission(999, {
          key: 'user:delete',
          description: 'Delete users',
        }),
      ).rejects.toThrow('Permission not found')
      expect(findByIdSpy).toHaveBeenCalled()
      expect(findByIdSpy).toHaveBeenCalledWith(999)
    })
    it('Should throw error for duplicate key', async () => {
      findByIdSpy = jest
        .spyOn(PermissionsRepository, 'findById')
        .mockResolvedValue(permissionData as unknown as Permission)
      findByKeySpy = jest.spyOn(PermissionsRepository, 'findByKey').mockResolvedValue({
        id: 2,
        key: 'user:delete',
        description: 'Delete users',
      } as Permission)
      await expect(
        PermissionsService.updatePermission(1, {
          key: 'user:delete',
          description: 'Delete users',
        }),
      ).rejects.toThrow('Permission with this key already exists')
      expect(findByIdSpy).toHaveBeenCalled()
      expect(findByIdSpy).toHaveBeenCalledWith(1)
      expect(findByKeySpy).toHaveBeenCalled()
      expect(findByKeySpy).toHaveBeenCalledWith('user:delete')
    })
  })
})
