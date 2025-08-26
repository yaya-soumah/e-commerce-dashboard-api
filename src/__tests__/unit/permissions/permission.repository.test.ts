import { Permission } from '../../../models'
import { PermissionsRepository } from '../../../components/permissions/permissions.repository'

describe('Permission Service', () => {
  const permissionData = { key: 'user:create', description: 'Create users' }
  const permissionTestData = { key: 'user:view', description: 'View list of users' }

  beforeAll(async () => {
    await Permission.create(permissionData)
  })

  describe('Create permission', () => {
    it('Should create permission', async () => {
      const permission = await PermissionsRepository.create(permissionTestData)

      expect(permission).toBeDefined()
      expect(permission.key).toBe(permissionTestData.key)
      expect(permission.description).toBe(permissionTestData.description)
    })
  })
  describe('Find all permissions', () => {
    it('Should get list of permissions', async () => {
      const permissions = await PermissionsRepository.findAll()

      expect(permissions).toBeDefined()
      expect(Array.isArray(permissions)).toBeTruthy()
    })
  })
  describe('Find permission by id', () => {
    it('Should get a permission by id', async () => {
      const permissions = await PermissionsRepository.findById(1)

      expect(permissions).toBeDefined()
    })
  })
  describe('Find permission by key', () => {
    it('Should get a permission by key', async () => {
      const permissions = await PermissionsRepository.findByKey('user:create')

      expect(permissions).toBeDefined()
    })
  })
})
