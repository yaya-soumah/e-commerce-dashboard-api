import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'
import { validate } from '../../middleware/validate.middleware'

import { CreateOrderItemSchema } from './order-item.schema'
import { OrderSchema, UpdateOrderSchema } from './order.schema'
import { OrderController } from './order.controller'

const router = Router()

router.use(authenticateToken)

router.get('/', OrderController.listOrder)
router.post(
  '/',
  authorizeRole('admin', 'staff'),
  validate(OrderSchema),
  OrderController.createOrder,
)
router.post(
  '/item/:id',
  authorizeRole('admin', 'staff'),
  validate(CreateOrderItemSchema),
  OrderController.addOrderItem,
)
router.get('/:id', OrderController.retrieveOrder)
router.patch(
  '/:id',
  authorizeRole('admin', 'staff'),
  validate(UpdateOrderSchema),
  OrderController.updateOrder,
)
router.delete('/:id', authorizeRole('admin'), OrderController.deleteOrder)

export default router
