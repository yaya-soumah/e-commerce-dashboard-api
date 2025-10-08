import { Router } from 'express'

import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { PaymentController } from './payment.controller'
import { PaymentCreateSchema, PaymentUpdateSchema } from './payment.schema'

const router = Router()

router.use(authenticateToken)

router.get('/', PaymentController.listHandler)

router.get(
  '/:id',

  PaymentController.getHandler,
)

router.post(
  '/:orderId',
  validate(PaymentCreateSchema),
  authorizeRole('admin', 'staff'),
  PaymentController.createHandler,
)

router.patch(
  '/:id',
  validate(PaymentUpdateSchema),
  authorizeRole('admin', 'staff'),
  PaymentController.updateHandler,
)

router.delete('/:id', authorizeRole('admin'), PaymentController.deleteHandler)

export default router
