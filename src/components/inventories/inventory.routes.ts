import { Router } from 'express'

import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { InventoryController } from './inventory.controller'
import { InventorySchema } from './inventory.schema'
const router = Router()

router.use(authenticateToken)

router.get('/', requirePermission('product:view'), InventoryController.getAll)
router.get('/history', authorizeRole('admin'), InventoryController.getHistoryHandler)
router.get('/:productId', requirePermission('product:view'), InventoryController.getProductHandler)
router.patch(
  '/:productId/restock',
  validate(InventorySchema),
  requirePermission('product:update'),
  InventoryController.restockHandler,
)
router.patch(
  '/:productId/decrement',
  validate(InventorySchema),
  requirePermission('product:update'),
  InventoryController.decrementStockHandler,
)

export default router
