import { PermissionsRepository } from './permissions.repository'

export class PermissionsService {
  static async getAllPermissions() {
    const permissions = await PermissionsRepository.findAll()
    if (!permissions) {
      throw new Error('No permissions found')
    }
    return permissions
  }

  static async getPermissionById(id: number) {
    const permission = await PermissionsRepository.findById(id)
    if (!permission) {
      throw new Error('Permission not found')
    }
    return permission
  }

  static async createPermission(data: { key: string; description: string }) {
    const existing = await PermissionsRepository.findByKey(data.key)
    if (existing) {
      throw new Error('Permission with this key already exists')
    }
    const newPermission = await PermissionsRepository.create(data)
    return newPermission
  }

  static async updatePermission(id: number, data: { key?: string; description?: string }) {
    const permission = await PermissionsRepository.findById(id)
    if (!permission) {
      throw new Error('Permission not found')
    }
    const existing = await PermissionsRepository.findByKey(data.key || '')
    if (existing && existing.id !== id) {
      throw new Error('Permission with this key already exists')
    }
    const updatedPermission = await PermissionsRepository.update(id, data)
    return updatedPermission
  }
}
