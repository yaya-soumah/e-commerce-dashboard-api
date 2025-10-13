import { Router } from 'express'

import authRouter from '../components/auth/auth.routes'
import roleRouter from '../components/roles/roles.routes'
import permissionsRouter from '../components/permissions/permissions.routes'
import userRouter from '../components/users/user.routes'
import productRouter from '../components/products/product.routes'
import inventoryRouter from '../components/inventories/inventory.routes'
import categoryRouter from '../components/categories/category.routes'
import tagRouter from '../components/tags/tag.routes'
import orderRouter from '../components/orders/order.routes'
import paymentRouter from '../components/payments/payment.routes'
import analyticRouter from '../components/analytics/analytic.routes'

const router = Router()

router.use('/auth', authRouter)

router.use('/users', userRouter)
router.use('/roles', roleRouter)
router.use('/permissions', permissionsRouter)
router.use('/products', productRouter)
router.use('/inventory', inventoryRouter)
router.use('/categories', categoryRouter)
router.use('/tags', tagRouter)
router.use('/orders', orderRouter)
router.use('/payments', paymentRouter)
router.use('/analytics', analyticRouter)

export default router
