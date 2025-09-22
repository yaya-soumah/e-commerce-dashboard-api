import { Router } from 'express'

import { authenticateToken } from '../../../middleware/auth.middleware'
import { authorizeRole } from '../../../middleware/requireRole.middleware'
import { validate } from '../../../middleware/validate.middleware'
import { ProductCreate, ProductUpdate } from '../schemas/product.schema'
import { ProductController } from '../controllers/product.controller'

const router = Router()

router.use(authenticateToken)

router.get('/', ProductController.listHandler)
router.get('/:id', ProductController.getByIdHandler)
router.post(
  '/',
  authorizeRole('admin', 'staff'),
  validate(ProductCreate),
  ProductController.createProductHandler,
)
router.patch(
  '/:id',
  authorizeRole('admin', 'staff'),
  validate(ProductUpdate),
  ProductController.updateProductHandler,
)
router.delete('/:id', authorizeRole('admin', 'staff'), ProductController.deleteProductHandler)

export default router
