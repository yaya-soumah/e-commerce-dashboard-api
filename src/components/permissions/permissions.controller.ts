import { Request, Response } from 'express'

import { success, error } from '../../utils/response.util'
import { AppError } from '../../utils/app-error.util'

import { PermissionsService } from './permissions.service'

export class PermissionsController {
  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await PermissionsService.getAllPermissions()

      success(res, 200, permissions, 'Permissions retrieved successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }

  static async getPermissionById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const permission = await PermissionsService.getPermissionById(Number(id))
      success(res, 200, permission, 'Permission retrieved successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }

  static async createPermission(req: Request, res: Response) {
    try {
      const { key, description } = req.body
      const newPermission = await PermissionsService.createPermission({ key, description })
      success(res, 201, newPermission, 'Permission created successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }

  static async updatePermission(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { key, description } = req.body
      const updatedPermission = await PermissionsService.updatePermission(Number(id), {
        key,
        description,
      })
      success(res, 200, updatedPermission, 'Permission updated successfully')
    } catch (err) {
      error(res, (err as AppError).statusCode, (err as AppError).message)
    }
  }
}
