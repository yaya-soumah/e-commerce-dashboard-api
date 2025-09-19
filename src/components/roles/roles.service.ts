import { AppError } from '../../utils/app-error.util'

import { RolesRepository } from './roles.repositories'

export class RolesService {
  static async createRole(name: string) {
    const existingRole = await RolesRepository.getByName(name)
    if (existingRole) throw new AppError('Role already exists', 400)

    return RolesRepository.create({ name })
  }

  static async getRoleById(id: number) {
    const role = await RolesRepository.getById(id)
    if (!role) throw new AppError('Role not found', 404)

    return role
  }

  static async getAllRoles() {
    return RolesRepository.getAll()
  }

  static async updateRole(id: number, name?: string, permissions?: string[]) {
    const existingRole = await RolesRepository.getById(id)

    if (!existingRole) throw new AppError('Role not found', 404)
    if (name) {
      const roleWithName = await RolesRepository.getByName(name)
      if (!roleWithName) {
        existingRole.update({ name })
      } else if (roleWithName.id !== id) {
        throw new AppError('Role with this name already exists', 400)
      }
    }
    if (permissions && permissions.length > 0) {
      existingRole.$add('permissions', permissions)
    }
    existingRole.save()

    return existingRole
  }

  static async deleteRole(id: number) {
    const buildInRoles = ['admin', 'staff', 'analyst']
    const deletedRole = await RolesRepository.getById(id)

    if (!deletedRole) throw new AppError('Role not found', 404)
    if (buildInRoles.includes(deletedRole.name)) {
      throw new AppError('Cannot delete built-in role', 400)
    }
    const users = await deletedRole.$get('users')
    if (users.length > 0) {
      throw new AppError('Cannot delete role assigned to users', 400)
    }

    return deletedRole.destroy()
  }
}
