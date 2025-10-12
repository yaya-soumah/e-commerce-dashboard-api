import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'
import { validate } from '../../middleware/validate.middleware'

import { FilterSchema } from './analytic.schema'
import { AnalyticController } from './analytic.controller'

const router = Router()

router.use(authenticateToken)
router.use(authorizeRole('admin', 'analytic'))
router.use(validate(FilterSchema))

router.get('/overview', AnalyticController.overviewHandler)

router.get('/sales', AnalyticController.salesHandler)

router.get('/top-products', AnalyticController.topProductsHandler)

router.get('/chart', AnalyticController.chartHandler)

router.get('/status', AnalyticController.statusHandler)

export default router
