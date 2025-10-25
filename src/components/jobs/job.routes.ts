import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { requirePermission } from '../../middleware/requirePermission.middleware'

import { JobBodySchema } from './job.schema'
import { JobController } from './job.controller'

const router = Router()

router.use(authenticateToken)

router.post(
  '/:jobName/run',
  validate(JobBodySchema),
  requirePermission('job:trigger'),
  JobController.triggerJob,
)
router.get('/:jobName/status', requirePermission('job:view'), JobController.getJobStatus)
router.get('/scheduled', requirePermission('job:view'), JobController.getScheduled)

export default router
