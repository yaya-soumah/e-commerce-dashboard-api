import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'
import { validate } from '../../middleware/validate.middleware'

import { ProductController } from './product.controller'
import { ProductCreate, ProductUpdate } from './product.schema'

const router = Router()

router.use(authenticateToken)

router.get('/', requirePermission('product:view'), ProductController.listHandler)
router.get('/:id', requirePermission('product:view'), ProductController.getByIdHandler)
router.post(
  '/',
  requirePermission('product:create'),
  validate(ProductCreate),
  ProductController.createProductHandler,
)
router.patch(
  '/:id',
  requirePermission('product:update'),
  validate(ProductUpdate),
  ProductController.updateProductHandler,
)
router.delete('/:id', requirePermission('product:delete'), ProductController.deleteProductHandler)

export default router
