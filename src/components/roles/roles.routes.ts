import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'
import { validate } from '../../middleware/validate.middleware'

import { RolesController } from './roles.controller'
import { CreateRoleSchema, UpdateRoleSchema } from './roles.schema'
const rolesRouter = Router()

rolesRouter.use(authenticateToken)
rolesRouter.use(authorizeRole('admin'))

rolesRouter.get('/', RolesController.getAllRoles)
rolesRouter.post('/', validate(CreateRoleSchema), RolesController.createRole)
rolesRouter.patch('/:roleId', validate(UpdateRoleSchema), RolesController.updateRole)
rolesRouter.delete('/:roleId', RolesController.deleteRole)

export default rolesRouter
