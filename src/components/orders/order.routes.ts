import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'
import { validate } from '../../middleware/validate.middleware'

import { CreateOrderItemSchema } from './order-item.schema'
import { OrderSchema, UpdateOrderSchema } from './order.schema'
import { OrderController } from './order.controller'

const router = Router()

router.use(authenticateToken)

router.get('/', requirePermission('order:view'), OrderController.listOrder)
router.post(
  '/',
  requirePermission('order:create'),
  validate(OrderSchema),
  OrderController.createOrder,
)
router.post(
  '/item/:id',
  requirePermission('order:create'),
  validate(CreateOrderItemSchema),
  OrderController.addOrderItem,
)
router.get('/:id', requirePermission('order:view'), OrderController.retrieveOrder)
router.patch(
  '/:id',
  requirePermission('order:update'),
  validate(UpdateOrderSchema),
  OrderController.updateOrder,
)
router.delete('/:id', requirePermission('order:delete'), OrderController.deleteOrder)

export default router
