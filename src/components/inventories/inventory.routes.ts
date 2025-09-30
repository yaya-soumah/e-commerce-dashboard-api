import { Router } from 'express'

import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { InventoryController } from './inventory.controller'
import { InventorySchema } from './inventory.schema'
const router = Router()

router.use(authenticateToken)

router.get('/', InventoryController.getAll)
router.get('/:productId', InventoryController.getProductHandler)
router.patch(
  '/:productId/restock',
  validate(InventorySchema),
  authorizeRole('admin', 'staff'),
  InventoryController.restockHandler,
)
router.patch(
  '/:productId/decrement',
  validate(InventorySchema),
  authorizeRole('admin', 'staff'),
  InventoryController.decrementStockHandler,
)
router.get('/history', authorizeRole('admin'), InventoryController.getHistoryHandler)

export default router
