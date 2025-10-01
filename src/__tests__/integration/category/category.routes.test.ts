import request from 'supertest'

import app from '../../../app'
import { generateTokens } from '../../utils/loader'

describe('Category API', () => {
  let adminToken: string
  let adminSession: string

  beforeAll(async () => {
    const { token, session } = await generateTokens('admin')
    adminToken = token
    adminSession = session
    await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', [session])
      .send({
        name: 'Electronic',
      })
  })

  describe('GET /categories', () => {
    it('Should get list of all categories', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSession])

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).not.toHaveLength(0)
    })
  })
  describe('GET /categories/:id', () => {
    it('Should get category by id', async () => {
      const res = await request(app)
        .get('/api/v1/categories/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSession])

      expect(res.status).toBe(200)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('name', 'Electronic')
    })
  })
  describe('POST /categories', () => {
    it('Should create category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSession])
        .send({ name: 'Home Appliances' })

      expect(res.status).toBe(201)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('name', 'Home Appliances')
    })
  })
  describe('PATCH /categories/:id', () => {
    it('Should update category', async () => {
      const res = await request(app)
        .patch('/api/v1/categories/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSession])
        .send({ description: 'Domestic Electrical appliances' })

      expect(res.status).toBe(200)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('description', 'Domestic Electrical appliances')
    })
  })
  describe('DELETE /categories/:id', () => {
    it('Should delete category', async () => {
      const res = await request(app)
        .delete('/api/v1/categories/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSession])

      expect(res.status).toBe(200)
    })
  })
})
