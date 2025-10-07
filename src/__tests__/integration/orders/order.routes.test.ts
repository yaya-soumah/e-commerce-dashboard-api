import request from 'supertest'

import { generateTokens } from '../../utils/loader'
import app from '../../../app'
import { generateSlug } from '../../../utils/slag'
import { User } from '../../../models'

describe('Order API', () => {
  let adminToken: string
  let adminCookie: string
  let admin: User = null
  let productId: number

  beforeAll(async () => {
    const { token: adToken, session: adSession, user } = await generateTokens('admin')
    adminToken = adToken
    adminCookie = adSession
    admin = user

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
        stock: 100,
        sku: 'TEST-001',
        categoryId: category.body.data.id,
        tags: ['test'],
        images: ['https://example.com/test.jpg'],
      })

    productId = productData.body.data.id
    // create new order
    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])
      .send({
        customerName: 'admin',
        items: [{ productId, quantity: 10 }],
        shippingAddress: 'address',
      })
  })

  describe('GET /orders', () => {
    it('Should get all orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminCookie])

      console.log('res.body')
      expect(res.status).toBe(200)
    })
  })
})
