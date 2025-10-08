import request from 'supertest'

import app from '../../../app'
import { generateTokens } from '../../utils/loader'
import { generateSlug } from '../../../utils/slag'
import { Order } from '../../../models'

describe('Payments Component', () => {
  let adminToken: string
  let adminCookie: string
  let staffToken: string
  let staffCookie: string
  let analystToken: string
  let analystCookie: string

  let orderId: number
  let productId: number

  beforeAll(async () => {
    const { token: adToken, session: adSession } = await generateTokens('admin')
    adminToken = adToken
    adminCookie = adSession

    const { token: stToken, session: stSession } = await generateTokens('staff')
    staffToken = stToken
    staffCookie = stSession

    const { token: anToken, session: anSession } = await generateTokens('analyst')
    analystToken = anToken
    analystCookie = anSession

    //create category
    const category = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])
      .send({
        name: 'Smartphones',
        description: 'Mobile phones',
        slug: generateSlug('Smartphones'),
      })

    // Seed product
    const productData = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])
      .send({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        status: 'active',
        lowStockLevel: 0,
        stock: 50,
        sku: 'TEST-001',
        categoryId: category.body.data.id,
        tags: ['test'],
        images: ['https://example.com/test.jpg'],
      })

    productId = productData.body.data.id

    //update the product's stock to create an inventory
    await request(app)
      .patch('/api/v1/products/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])
      .send({
        stock: 100,
      })

    // create new order
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])
      .send({
        customerName: 'Alice',
        items: [{ productId, quantity: 10 }],
        shippingAddress: 'address',
      })
    orderId = orderRes.body.data.id
  })

  describe('POST /payments', () => {
    it('should allow staff to create payment for order', async () => {
      const res = await request(app)
        .post(`/api/v1/payments/${orderId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffCookie])
        .send({
          status: 'paid',
          method: 'credit_card',
          transactionId: 'TXN-001',
          paidAt: new Date().toISOString(),
          amount: 109.98,
          notes: 'Payment received',
        })
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.status).toBe('paid')
      expect(res.body.data.amount).toBe(109.98)

      // Verify order paymentStatus synced
      const updatedOrder = await Order.findByPk(orderId)
      expect(updatedOrder?.paymentStatus).toBe('paid')
    })
    it('should prevent duplicate payment for order', async () => {
      const res = await request(app)
        .post(`/api/v1/payments/${orderId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffCookie])
        .send({
          status: 'paid',
          method: 'cash',
          amount: 109.98,
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Order already has a payment')
    })

    it('should prevent analyst from creating payment', async () => {
      const res = await request(app)
        .post(`/api/v1/payments/${orderId}`)
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystCookie])
        .send({
          status: 'paid',
          method: 'manual',
          amount: 100,
        })
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Access denied: insufficient role')
    })

    it('should validate payment creation', async () => {
      const response = await request(app)
        .post(`/api/v1/payments/${orderId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffCookie])
        .send({
          status: 'invalid',
          method: 'invalid',
          amount: -10,
        })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })
  })

  describe('PATCH /payments/:id', () => {
    it('should allow admin to update payment', async () => {
      const res = await request(app)
        .patch(`/api/v1/payments/1`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({ status: 'paid', paidAt: new Date().toISOString() })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.status).toBe('paid')
    })

    it('should prevent amount update for paid payment', async () => {
      const res = await request(app)
        .patch(`/api/v1/payments/1`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({ amount: 200 })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Cannot update amount for paid payment')
    })
  })

  describe('GET /payments', () => {
    it('should allow analyst to list payments', async () => {
      const res = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystCookie])
        .query({ status: 'paid', page: 1, limit: 10 })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
    })
  })

  describe('DELETE /payments/:id', () => {
    it('should allow admin to delete payment for cancelled order', async () => {
      //create a new order
      const orderRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({
          customerName: 'Bob',
          items: [{ productId, quantity: 10 }],
          shippingAddress: 'test address',
        })

      //pay the order
      const paymentRes = await request(app)
        .post(`/api/v1/payments/${orderRes.body.data.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffCookie])
        .send({
          status: 'unpaid',
          method: 'credit_card',
          transactionId: 'TXN-001',
          paidAt: new Date().toISOString(),
          amount: 109.98,
          notes: 'Payment received',
        })
      //cancel the order
      await request(app)
        .patch(`/api/v1/orders/${orderRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({
          status: 'cancelled',
        })
      orderId = orderRes.body.data.id

      //attempt to delete the cancelled order
      const res = await request(app)
        .delete(`/api/v1/payments/${paymentRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
    })

    it('should prevent deletion for active order', async () => {
      //create a new order
      const orderRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({
          customerName: 'Alex',
          items: [{ productId, quantity: 50 }],
          shippingAddress: 'test2 address',
        })

      //pay the order
      const paymentRes = await request(app)
        .post(`/api/v1/payments/${orderRes.body.data.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffCookie])
        .send({
          status: 'paid',
          method: 'credit_card',
          transactionId: 'TXN-001',
          paidAt: new Date().toISOString(),
          amount: 200,
          notes: 'Payment received',
        })

      const res = await request(app)
        .delete(`/api/v1/payments/${paymentRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Cannot delete payment for active order')
    })
  })
})
