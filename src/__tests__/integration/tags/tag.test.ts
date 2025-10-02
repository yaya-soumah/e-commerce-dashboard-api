import request from 'supertest'

import { generateTokens } from '../../utils/loader'
import app from '../../../app'

describe('Tag API', () => {
  let adminToken: string
  let adminSessionToken: string
  beforeAll(async () => {
    const { token, session } = await generateTokens('admin')
    adminToken = token
    adminSessionToken = session
    // add a seed data
    await request(app)
      .post('/api/v1/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminSessionToken])
      .send({ name: 'test tag' })
  })

  describe('GET', () => {
    it('Should get all tags', async () => {
      const res = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionToken])

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe('GET', () => {
    it('Should get all tags', async () => {
      const res = await request(app)
        .get('/api/v1/tags/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionToken])

      expect(res.status).toBe(200)
      expect(typeof res.body.data).toBe('object')
    })
  })
  describe('POST', () => {
    it('Should create a tag', async () => {
      const res = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionToken])
        .send({ name: 'new test tag' })

      expect(res.status).toBe(201)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('name', 'new test tag')
    })
  })
  describe('PATCH', () => {
    it('Should update a tag', async () => {
      const res = await request(app)
        .patch('/api/v1/tags/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionToken])
        .send({ name: 'update test tag' })

      expect(res.status).toBe(200)
      expect(typeof res.body.data).toBe('object')
      expect(res.body.data).toHaveProperty('name', 'update test tag')
    })
  })
  describe('DELETE', () => {
    it('Should delete a tag', async () => {
      const res = await request(app)
        .delete('/api/v1/tags/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionToken])

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Tag deleted successfully')
    })
  })
})
