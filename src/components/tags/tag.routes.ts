import Router from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'
import { validate } from '../../middleware/validate.middleware'

import { TagController } from './tag.controller'
import { TagSchema } from './tag.schema'

const router = Router()

router.use(authenticateToken)

router.get('/', TagController.listHandler)
router.get('/:id', TagController.retrieveTagHandler)
router.post('/', authorizeRole('admin'), validate(TagSchema), TagController.createTagHandler)
router.patch('/:id', authorizeRole('admin'), TagController.updateTagHandler)
router.delete('/:id', authorizeRole('admin'), TagController.deleteTagHandler)

export default router
