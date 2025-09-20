import { Router } from 'express'

import authRouter from '../components/auth/auth.routes'
import roleRouter from '../components/roles/roles.routes'
import permissionsRouter from '../components/permissions/permissions.routes'
import userRouter from '../components/users/user.routes'
import productRouter from '../components/products/product.routes'
const router = Router()

router.use('/auth', authRouter)

router.use('/users', userRouter)
router.use('/roles', roleRouter)
router.use('/permissions', permissionsRouter)
router.use('/products', productRouter)

export default router
