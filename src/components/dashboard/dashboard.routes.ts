import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { DashboardMetricsController } from './dashboard.controller'

const router = Router()

router.use(authenticateToken)
router.use(authorizeRole('admin', 'analyst'))
router.get('/', DashboardMetricsController.getMetricsHandler)

export default router
