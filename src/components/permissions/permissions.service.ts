import { AppError } from '../../utils/app-error.util'

import { PermissionsRepository } from './permissions.repository'

export class PermissionsService {
  static async getAllPermissions() {
    const permissions = await PermissionsRepository.findAll()
    if (!permissions) {
      throw new AppError('No permissions found', 404)
    }
    return permissions
  }

  static async getPermissionById(id: number) {
    const permission = await PermissionsRepository.findById(id)
    if (!permission) {
      throw new AppError('Permission not found', 404)
    }
    return permission
  }

  static async createPermission(data: { key: string; description: string }) {
    const existing = await PermissionsRepository.findByKey(data.key)
    if (existing) {
      throw new AppError('Permission with this key already exists', 400)
    }
    const newPermission = await PermissionsRepository.create(data)
    return newPermission
  }

  static async updatePermission(id: number, data: { key?: string; description?: string }) {
    const permission = await PermissionsRepository.findById(id)
    if (!permission) {
      throw new AppError('Permission not found', 404)
    }
    const existing = await PermissionsRepository.findByKey(data.key || '')
    if (existing && existing.id !== id) {
      throw new AppError('Permission with this key already exists', 400)
    }
    await permission.update(data)
    permission.save()
    return permission
  }
}
