import request from 'supertest'

import { generateTokens } from '../../utils/loader'
import app from '../../../app'
import { generateSlug } from '../../../utils/slag'
// import { User } from '../../../models'

describe('Order API', () => {
  let adminToken: string
  let adminCookie: string
  //   let admin: User = null
  let productId: number

  beforeAll(async () => {
    const { token: adToken, session: adSession } = await generateTokens('admin')
    adminToken = adToken
    adminCookie = adSession
    // admin = user

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

    //create product
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
    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])
      .send({
        customerName: 'Alice',
        items: [{ productId, quantity: 10 }],
        shippingAddress: 'address',
      })
  })

  // get list
  describe('GET /orders', () => {
    it('Should get all orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  // get one order
  describe('GET /orders:id', () => {
    it('Should get order by id', async () => {
      const res = await request(app)
        .get('/api/v1/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      expect(res.status).toBe(200)
      expect(res.body.data).toBeTruthy()
      expect(Array.isArray(res.body.data)).toBe(false)
      expect(typeof res.body.data).toBe('object')
    })
  })

  //update order
  describe('PATCH /orders/:id', () => {
    it('Should update order by id', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({
          shippingAddress: 'updated address',
        })

      expect(res.status).toBe(200)
      expect(res.body.data).toBeTruthy()
      expect(Array.isArray(res.body.data)).toBe(false)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('shippingAddress', 'updated address')
    })
  })
  //add new item to order
  describe('POST /orders/items:id', () => {
    it('Should add new order item', async () => {
      const res = await request(app)
        .delete('/api/v1/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({ productId, quantity: 10 })

      expect(res.status).toBe(200)
      expect(res.body.data).toBeTruthy()
      expect(Array.isArray(res.body.data)).toBe(false)
      expect(typeof res.body.data).toBe('object')
    })
  })

  //delete order
  describe('DELETE /orders/:id', () => {
    it('Should delete order by id', async () => {
      const res = await request(app)
        .delete('/api/v1/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Order deleted successfully')
    })
  })

  //create an order
  describe('POST /orders', () => {
    it('Should create an order', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])
        .send({
          customerName: 'Alice',
          items: [{ productId, quantity: 10 }],
          shippingAddress: 'address',
        })

      expect(res.status).toBe(201)
      expect(res.body.data).toBeTruthy()
      expect(Array.isArray(res.body.data)).toBe(false)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('customerName', 'Alice')
    })
  })
})
