import { Router } from 'express'

import authRouter from '../components/auth/auth.routes'
import roleRouter from '../components/roles/roles.routes'
import permissionsRouter from '../components/permissions/permissions.routes'

const router = Router()

router.use('/auth', authRouter)

router.use('/roles', roleRouter)
router.use('/permissions', permissionsRouter)

export default router
