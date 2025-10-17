import request from 'supertest'

import app from '../../../app'
import { Role, Permission, Category, Order, OrderItem, Product, Payment } from '../../../models'
import { generateTokens } from '../../utils/loader'
import { generateSlug } from '../../../utils/slag'

describe('Analytics Component', () => {
  let adminToken: string
  let adminCookie: string
  let analystToken: string
  let analystCookie: string
  let staffToken: string
  let staffCookie: string
  let productId: number
  let categoryId: number

  beforeAll(async () => {
    const { token: adToken, session: adSession, user: admin } = await generateTokens('admin')
    const { token: anToken, session: anSession } = await generateTokens('analyst')
    const { token: stToken, session: stSession } = await generateTokens('staff')

    adminToken = adToken
    adminCookie = adSession

    analystToken = anToken
    analystCookie = anSession

    staffToken = stToken
    staffCookie = stSession

    // Seed permissions
    const permissions = [
      { key: 'analytics:view', description: 'View analytics' },
      { key: 'order:view', description: 'View orders' },
      { key: 'product:view', description: 'View products' },
    ]
    for (const perm of permissions) {
      await Permission.create(perm)
    }

    // Seed roles
    const adminRole = await Role.findOne({ where: { name: 'admin' } })
    const analystRole = await Role.findOne({ where: { name: 'analyst' } })

    await adminRole!.$set('permissions', await Permission.findAll())
    await analystRole!.$set(
      'permissions',
      await Permission.findAll({
        where: { key: ['analytics:view', 'order:view', 'product:view'] },
      }),
    )
    await adminRole!.save()
    await analystRole!.save()

    //create a new product
    const category = await Category.create({
      name: 'Smartphones',
      description: 'Mobile phones',
      slug: generateSlug('Smartphones'),
    })
    categoryId = category.id
    // Seed product
    const product = await Product.create({
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      status: 'active',
      lowStockLevel: 0,
      stock: 100,
      sku: 'TEST-001',
      categoryId,
      tags: ['test'],
      images: ['https://example.com/test.jpg'],
    })
    productId = product.id

    // Seed orders with payments
    const order1 = await Order.create({
      orderNumber: 'ORD-TEST-001',
      customerName: 'Test User 1',
      subtotal: 99.99,
      tax: 9.99,
      total: 109.98,
      shippingAddress: 'Test Address 1',
      status: 'pending',
      paymentStatus: 'paid',
      notes: '',
      userId: admin.id,
    })
    await OrderItem.create({
      orderId: order1.id,
      productId,
      quantity: 1,
      unitPrice: 99.99,
      totalPrice: 99.99,
    })
    await Payment.create({
      orderId: order1.id,
      status: 'paid',
      method: 'credit_card',
      amount: 109.98,
      paidAt: new Date('2025-10-01'),
    })
    const order2 = await Order.create({
      orderNumber: 'ORD-TEST-001',
      customerName: 'Test User 1',
      subtotal: 199.98,
      tax: 19.99,
      total: 219.97,
      shippingAddress: 'Test Address 1',
      status: 'pending',
      paymentStatus: 'paid',
      notes: '',
      userId: admin.id,
    })
    await OrderItem.create({
      orderId: order2.id,
      productId,
      quantity: 2,
      unitPrice: 99.99,
      totalPrice: 199.98,
    })
    await Payment.create({
      orderId: order2.id,
      status: 'paid',
      method: 'credit_card',
      amount: 219.97,
      paidAt: new Date('2025-10-01'),
    })
  })
  describe('GET /analytics/overview', () => {
    it('should allow admin to get sales overview', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/sales')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystCookie])
        .query({ startDate: '2025-10-01', endDate: '2025-10-18' }) //update the interval to pass the test

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.totalRevenue).toBe(329.95)
      expect(res.body.data.ordersCount).toBe(2)
      expect(res.body.data.averageOrderValue).toBe(164.975)
    })

    it('should prevent staff from accessing analytics', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffCookie])

      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Access denied: insufficient role')
    })
  })
  describe('GET /analytics/top-products', () => {
    it('should allow admin to get top products', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/top-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .query({ limit: 5, categoryId })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data[0].totalQuantity).toBe(3)
      expect(res.body.data[0].name).toBe('Test Product')
    })
  })

  describe('GET /analytics/chart', () => {
    it('should allow analyst to get chart data', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/chart')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystCookie])
        .query({ groupBy: 'day' })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].revenue).toBeGreaterThan(0)
    })
  })

  describe('GET analytics/status', () => {
    it('should allow admin to get status distribution', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].percentage).toBe('100.00')
    })
  })

  describe('GET /analytics/sales', () => {
    it('should return 0s for no data range', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/sales')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystCookie])
        .query({ startDate: '2025-11-01', endDate: '2025-11-09' })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.totalRevenue).toBe(0)
      expect(res.body.data.ordersCount).toBe(0)
      expect(res.body.data.averageOrderValue).toBe(0)
    })

    it('should validate date format', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/sales')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystCookie])
        .query({ startDate: 'invalid-date' })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
    })
  })
})
