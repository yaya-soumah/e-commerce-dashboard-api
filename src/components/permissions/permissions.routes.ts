import Router from 'express'

import { authorizeRole } from '../../middleware/requireRole.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'

import { PermissionsController } from './permissions.controller'

const permissionsRouter = Router()

permissionsRouter.use(authenticateToken)
permissionsRouter.use(authorizeRole('admin'))

permissionsRouter.get('/', PermissionsController.getAllPermissions)
permissionsRouter.get('/:id', PermissionsController.getPermissionById)
permissionsRouter.post('/', PermissionsController.createPermission)
permissionsRouter.patch('/:id', PermissionsController.updatePermission)

export default permissionsRouter
