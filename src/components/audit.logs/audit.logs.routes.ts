import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'

import { AuditLogController } from './audit.logs.controller'

const router = Router()

router.use(authenticateToken)
router.use(requirePermission('audit:view'))

router.get('/', AuditLogController.ListHandler)
router.get('/:id', AuditLogController.logHandler)

export default router
