import request from 'supertest'

import app from '../../../app'
import { generateTokens } from '../../utils/loader'
import { Category } from '../../../models'
import { generateSlug } from '../../../utils/slag'

describe('Inventory API', () => {
  let adminToken: string
  let adminSessionCookie: string

  beforeAll(async () => {
    const { token: adToken, session: adSession } = await generateTokens('admin')
    adminToken = adToken
    adminSessionCookie = adSession

    //create a new product
    const category = await Category.create({
      name: 'Smartphones',
      description: 'Mobile phones',
      slug: generateSlug('Smartphones'),
    })

    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminSessionCookie])
      .send({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        status: 'active',
        lowStockLevel: 0,
        stock: 100,
        sku: 'TEST-001',
        categoryId: category.id,
        tags: ['test'],
        images: ['https://example.com/test.jpg'],
      })
  })

  describe('GET /inventory', () => {
    it('should get a list of all inventories', async () => {
      const res = await request(app)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])

      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })
  describe('GET /inventory/:productId', () => {
    it('should get the product by id', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])

      expect(res.body.data).not.toBeNull()
      expect(res.body.data).not.toBeUndefined()
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('productId')
      expect(res.body.data).toHaveProperty('stock')
    })
  })
  describe('PATCH /inventory/:productId/restock', () => {
    it('should restock', async () => {
      const res = await request(app)
        .patch('/api/v1/inventory/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({ quantity: 10, reason: 'new arrival' })

      expect(res.body.data).not.toBeNull()
      expect(res.body.data).not.toBeUndefined()
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('productId')
      expect(res.body.data).toHaveProperty('stock', 110)
    })
  })
  describe('PATCH /inventory/:productId/decrement', () => {
    it('should decrement stock', async () => {
      const res = await request(app)
        .patch('/api/v1/inventory/1/decrement')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({ quantity: 60, reason: 'sold' })

      expect(res.body.data).not.toBeNull()
      expect(res.body.data).not.toBeUndefined()
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('productId')
      expect(res.body.data).toHaveProperty('stock', 50)
    })
  })
  describe('GET /inventory/history', () => {
    it('should get the list of all histories', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/history')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])

      expect(res.body.data).not.toBeNull()
      expect(res.body.data).not.toBeUndefined()
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })
})
