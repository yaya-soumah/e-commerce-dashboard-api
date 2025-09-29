import request from 'supertest'

import app from '../../../app'
import { Permission } from '../../../models'
import { generateTokens } from '../../utils/loader'

describe('permissions API', () => {
  let adminToken: string
  let sessionCookie: string

  beforeAll(async () => {
    //seed to create an admin

    const { token, session } = await generateTokens('admin')

    adminToken = token
    sessionCookie = session
  })

  describe('Post /api/v1/permissions', () => {
    it('Should create permission', async () => {
      const res = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          key: 'testPermission',
          description: 'A test permission',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.key).toBe('testPermission')
      expect(res.body.data.description).toBe('A test permission')
    })
    it('Should throw error for non admin role', async () => {
      const { token, session } = await generateTokens('staff')

      const res = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [session])
        .send({
          key: 'testPermission',
          description: 'A test permission',
        })
      expect(res.status).toBe(403)
    })
    it('Should throw error for missing token', async () => {
      const res = await request(app)
        .post('/api/v1/permissions')
        .set('Cookie', [sessionCookie])
        .send({
          key: 'testPermission',
          description: 'A test permission',
        })
      expect(res.status).toBe(401)
    })
    it('Should throw error for existing permission', async () => {
      const res = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          key: 'testPermission',
          description: 'A test permission',
        })

      expect(res.status).toBe(400)
    })
  })

  describe('Get /api/v1/permissions', () => {
    it('Should get all permissions', async () => {
      const res = await request(app)
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('Patch /api/v1/permissions/:id', () => {
    it('Should update permission', async () => {
      const [permission] = await Permission.findOrCreate({
        where: { key: 'testPermission', description: 'A test permission' },
      })
      const res = await request(app)
        .patch(`/api/v1/permissions/${permission.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          key: 'updatedTestPermission',
          description: 'A test permission',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.key).toBe('updatedTestPermission')
    })
    it('Should throw error for missing token', async () => {
      const [permission] = await Permission.findOrCreate({
        where: { key: 'testPermission', description: 'A test permission' },
      })
      const res = await request(app)
        .patch(`/api/v1/permissions/${permission.id}`)
        .set('Cookie', [sessionCookie])
        .send({
          key: 'updatedTestPermission',
          description: 'A test permission',
        })

      expect(res.status).toBe(401)
    })
  })
})
