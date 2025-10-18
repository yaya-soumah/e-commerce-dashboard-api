import { Router } from 'express'

import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'

import { PaymentController } from './payment.controller'
import { PaymentCreateSchema, PaymentUpdateSchema } from './payment.schema'

const router = Router()

router.use(authenticateToken)

router.get('/', requirePermission('payment:view'), PaymentController.listHandler)

router.get('/:id', requirePermission('payment:view'), PaymentController.getHandler)

router.post(
  '/:orderId',
  validate(PaymentCreateSchema),
  requirePermission('payment:create'),
  PaymentController.createHandler,
)

router.patch(
  '/:id',
  validate(PaymentUpdateSchema),
  requirePermission('payment:update'),
  PaymentController.updateHandler,
)

router.delete('/:id', authorizeRole('admin'), PaymentController.deleteHandler)

export default router
