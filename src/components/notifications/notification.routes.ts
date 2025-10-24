import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'
import { validate } from '../../middleware/validate.middleware'

import { NotificationController } from './notification.controller'
import { NotificationUpdateBodySchema } from './notification.schema'

const router = Router()
router.use(authenticateToken)

router.get('/', requirePermission('notification:view'), NotificationController.getNotifications)
router.patch('/:id/read', requirePermission('notification:update'), NotificationController.markRead)
router.post(
  '/mark-all-read',
  requirePermission('notification:update'),
  NotificationController.markAllRead,
) // For bulk
router.get('/settings', requirePermission('notification:view'), NotificationController.getSettings)
router.patch(
  '/settings/:type',
  validate(NotificationUpdateBodySchema),
  requirePermission('notification:update'),
  NotificationController.updateSetting,
)

export default router
