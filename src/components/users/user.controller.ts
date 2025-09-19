import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { UserService } from './user.service'

export class UserController {
  static async userList(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query
      let users = await UserService.getAllUsers({ query })

      // list with pagination
      if ('page' in (query || {})) {
        users = await UserService.getAllUsers({ isPagination: true, query })
      }

      success(res, 200, users, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = (req as any).user
      const user = await UserService.getProfile(Number(userId))
      success(res, 200, user, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const user = await UserService.getProfile(Number(id))
      success(res, 200, user, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const data = req.body
      const user = await UserService.updateUser(Number(id), data)
      success(res, 200, user, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }

  static async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { role } = req.body

      const user = await UserService.ChangeUserRole(Number(id), role)
      success(res, 200, user, 'ROle updated successfully')
    } catch (err) {
      next(err)
    }
  }
  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { newPassword, oldPassword } = req.body

      const user = await UserService.updatePassword(Number(id), newPassword, oldPassword)
      success(res, 200, user, 'Password updated successfully')
    } catch (err) {
      next(err)
    }
  }
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { status } = req.body

      const user = await UserService.ChangeUserRole(Number(id), status)
      success(res, 200, user, 'Status updated successfully')
    } catch (err) {
      next(err)
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      await UserService.deleteUser(Number(id))
      success(res, 204, null, 'Operation successful')
    } catch (err) {
      next(err)
    }
  }
}
