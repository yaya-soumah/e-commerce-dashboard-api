import { Router } from 'express'

import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { authorizeRole } from '../../middleware/requireRole.middleware'

import { RegisterSchema, LoginSchema } from './auth.schema'
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  refreshTokenHandler,
  getCurrentUserHandler,
} from './auth.Controller'

const router = Router()

router.post(
  '/register',
  authenticateToken,
  authorizeRole('admin'),
  validate(RegisterSchema),
  registerHandler,
)
router.post('/login', validate(LoginSchema), loginHandler)
router.post('/refresh', refreshTokenHandler)
router.post('/logout', logoutHandler)
router.get('/me', authenticateToken, getCurrentUserHandler)

export default router
