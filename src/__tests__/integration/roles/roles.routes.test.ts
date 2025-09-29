import request from 'supertest'

import app from '../../../app'
import { Role, Permission } from '../../../models'
import { signRefreshToken, signAccessToken } from '../../../utils/jwt.util'
import { generateTokens } from '../../utils/loader'

import { defaultPermissions } from './roles.factory'

describe('Roles API', () => {
  let adminToken: string
  let sessionCookie: string

  beforeAll(async () => {
    const { token: adToken, session: adSession } = await generateTokens('admin')

    adminToken = adToken
    sessionCookie = adSession
  })

  describe('Post /api/v1/roles', () => {
    it('Should create role', async () => {
      const res = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          name: 'testRole',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.name).toBe('testRole')
    })
    it('Should throw error for non admin role', async () => {
      const nonAdminPayload = { userId: 3, email: 'non-admin@example.com', role: 'staff' }
      const nonAdminToken = signAccessToken(nonAdminPayload)
      const nonAdminRefreshToken = signRefreshToken(nonAdminPayload)
      const nonAdminSessionCookie = `refreshToken=${nonAdminRefreshToken}; HttpOnly; Secure=false; SameSite=strict`

      const res = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .set('Cookie', [nonAdminSessionCookie])
        .send({
          name: 'testRole',
        })
      expect(res.status).toBe(403)
    })
    it('Should throw error for missing token', async () => {
      const res = await request(app).post('/api/v1/roles').set('Cookie', [sessionCookie]).send({
        name: 'testRole',
      })
      expect(res.status).toBe(401)
    })
    it('Should throw error for existing role', async () => {
      const res = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          name: 'admin',
        })

      expect(res.status).toBe(400)
    })
  })

  describe('Get /api/v1/roles', () => {
    it('Should get all roles', async () => {
      const res = await request(app)
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('Patch /api/v1/roles/:roleId', () => {
    it('Should update role name', async () => {
      const [role] = await Role.findOrCreate({ where: { name: 'staff' } })
      const res = await request(app)
        .patch(`/api/v1/roles/${role.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          name: 'updatedTestRole',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('updatedTestRole')
    })
    it('Should update role permissions', async () => {
      // Ensure default permissions are created
      const permissions: Permission[] = []
      for (const perm of defaultPermissions) {
        const [permission] = await Permission.findOrCreate({
          where: { key: perm.key },
          defaults: perm,
        })
        permissions.push(permission.id)
      }
      const [role] = await Role.findOrCreate({ where: { name: 'updatedTestRole' } })
      const res = await request(app)
        .patch(`/api/v1/roles/${role.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
        .send({
          name: 'updatedTestRole',
          permissions,
        })
      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('updatedTestRole')
    })
    it('Should throw error for missing token', async () => {
      const [role] = await Role.findOrCreate({ where: { name: 'staff' } })
      const res = await request(app)
        .patch(`/api/v1/roles/${role.id}`)
        .set('Cookie', [sessionCookie])
        .send({
          name: 'updatedTestRole',
        })

      expect(res.status).toBe(401)
    })
  })

  describe('Delete /api/v1/roles/:roleId', () => {
    it('Should delete role', async () => {
      const [role] = await Role.findOrCreate({ where: { name: 'testRole' } })
      const res = await request(app)
        .delete(`/api/v1/roles/${role.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [sessionCookie])
      console.log('Response delete role:', res.body)
      expect(res.status).toBe(204)
    })
    it('Should throw error for missing token', async () => {
      const [role] = await Role.findOrCreate({ where: { name: 'staff' } })
      const res = await request(app)
        .delete(`/api/v1/roles/${role.id}`)
        .set('Cookie', [sessionCookie])

      expect(res.status).toBe(401)
    })
  })
})
