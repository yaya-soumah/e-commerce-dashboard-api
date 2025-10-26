import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { SettingController } from './settings.controller'
import { SettingBodySchema } from './settings.schema'

const router = Router()
router.use(authenticateToken)
router.use(authorizeRole)

router.get('/', SettingController.getAll)
router.get('/:key', SettingController.getOne)
router.patch('/', validate(SettingBodySchema), SettingController.updateMany)
router.patch('/:key', validate(SettingBodySchema), SettingController.updateOne)

export default router
