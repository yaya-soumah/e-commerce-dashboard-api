import Router from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'
import { validate } from '../../middleware/validate.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'

import { CategoryController } from './category.controller'
import { CategoryCreateSchema, CategoryUpdateSchema } from './category.schema'

const router = Router()

router.use(authenticateToken)

router.get('/', requirePermission('category:view'), CategoryController.listHandler)
router.get('/:id', requirePermission('category:view'), CategoryController.retrieveHandler)
router.post(
  '/',
  authorizeRole('admin'),
  validate(CategoryCreateSchema),
  CategoryController.createHandler,
)
router.patch(
  '/:id',
  authorizeRole('admin'),
  validate(CategoryUpdateSchema),
  CategoryController.updateHandler,
)
router.delete('/:id', authorizeRole('admin'), CategoryController.deleteHandler)

export default router
