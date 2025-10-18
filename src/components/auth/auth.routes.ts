import { Router } from 'express'

import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'

import { RegisterSchema, LoginSchema } from './auth.schema'
import { AuthController } from './auth.Controller'

const router = Router()

router.post(
  '/register',
  authenticateToken,
  validate(RegisterSchema),
  AuthController.registerHandler,
)
router.post('/login', validate(LoginSchema), AuthController.loginHandler)
router.post('/refresh', AuthController.refreshTokenHandler)
router.post('/logout', AuthController.logoutHandler)
router.get('/me', authenticateToken, AuthController.getCurrentUserHandler)

export default router
