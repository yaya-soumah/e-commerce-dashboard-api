import { Router } from 'express'

import { productImagesUpload, avatarUpload } from '../../middleware/uploads.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { UploadController } from './upload.controller'

const router = Router()

router.post(
  '/products/:productId',
  requirePermission('product:update'),
  productImagesUpload,
  UploadController.uploadProductImages,
)

router.post('/avatar', authorizeRole('owner'), avatarUpload, UploadController.uploadAvatar)

router.delete('/:id', authorizeRole('admin'), UploadController.deleteUpload)

export default router
