import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'

import { DashboardMetricsController } from './dashboard.controller'

const router = Router()

router.use(authenticateToken)
router.use(requirePermission('dashboard:view'))
router.get('/', DashboardMetricsController.getMetricsHandler)

export default router
