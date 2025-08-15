import { Request, Response } from 'express'

import { success, error } from '../../utils/response.util'
import { AppError } from '../../utils/app-error.util'

import { RolesService } from './roles.service'

export class RolesController {
  static async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await RolesService.getAllRoles()
      success(res, 200, roles, 'Roles fetched successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }

  static async createRole(req: Request, res: Response) {
    try {
      const { name } = req.body
      const role = await RolesService.createRole(name)
      success(res, 201, role, 'Role created successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params
      const { name, permissions } = req.body
      const updatedRole = await RolesService.updateRole(Number(roleId), name, permissions)
      success(res, 200, updatedRole, 'Role updated successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params
      await RolesService.deleteRole(Number(roleId))
      success(res, 204, {}, 'Role deleted successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }
}
