import Router from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { UserController } from './user.controller'
import {
  ChangePasswordSchema,
  UpdateStatusSchema,
  UpdateUserSchema,
  UpdateRoleSchema,
} from './user.schema'

const router = Router()
router.use(authenticateToken)

router.get('/', authorizeRole('admin'), UserController.userList)
router.get('/me', UserController.getCurrentUser)
router.get('/:id', authorizeRole('owner'), UserController.getUser)
router.patch('/:id', authorizeRole('owner'), validate(UpdateUserSchema), UserController.updateUser)
router.patch(
  '/:id/password',
  authorizeRole('owner'),
  validate(ChangePasswordSchema),
  UserController.updatePassword,
)
router.patch(
  '/:id/status',
  authorizeRole('admin'),
  validate(UpdateStatusSchema),
  UserController.updateStatus,
)
router.patch(
  '/:id/role',
  authorizeRole('admin'),
  validate(UpdateRoleSchema),
  UserController.changeRole,
)
router.delete('/:id', authorizeRole('admin'), UserController.updateUser)

export default router
