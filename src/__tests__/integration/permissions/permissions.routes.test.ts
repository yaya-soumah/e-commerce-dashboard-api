import request from 'supertest'

import app from '../../../app'
import { User, Role, Permission } from '../../../models'
import { signRefreshToken, signAccessToken } from '../../../utils/jwt.util'
import { parse } from '../../../utils/bcrypt.util'

describe('permissions API', () => {
  let adminToken: string
  let refreshToken: string
  let sessionCookie: string

  beforeAll(async () => {
    //seed to create an admin
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } })
    const [adminUser] = await User.findOrCreate({
      where: {
        name: 'admin',
      },
      defaults: {
        name: 'Admin',
        email: 'admin@example.com',
        roleId: adminRole.id,
        password: await parse('Password123'),
      },
    })

    const payload = {
      userId: adminUser.id,
      email: adminUser.email,
      roleName: adminRole.name,
    }
    adminToken = signAccessToken(payload)
    refreshToken = signRefreshToken(payload)
    sessionCookie = `refreshToken=${refreshToken}; HttpOnly; Secure=false; SameSite=strict`
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
      const nonAdminPayload = { userId: 3, email: 'non-admin@example.com', roleName: 'staff' }
      const nonAdminToken = signAccessToken(nonAdminPayload)
      const nonAdminRefreshToken = signRefreshToken(nonAdminPayload)
      const nonAdminSessionCookie = `refreshToken=${nonAdminRefreshToken}; HttpOnly; Secure=false; SameSite=strict`

      const res = await request(app)
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .set('Cookie', [nonAdminSessionCookie])
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
