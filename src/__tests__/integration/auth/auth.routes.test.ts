import request from 'supertest'

import app from '../../../app'
import { signAccessToken, signRefreshToken } from '../../../utils/jwt.util'

import { authFactory } from './auth.factory'

describe('Auth API', () => {
  let adminToken: string
  let adminRefreshToken: string
  let adminSessionCookie: string
  let nonAdminToken: string

  beforeAll(async () => {
    let adminPayload = { userId: 1, email: 'admin@example.com', role: 'admin' }
    adminToken = signAccessToken(adminPayload)
    adminRefreshToken = signRefreshToken(adminPayload)
    adminSessionCookie = `refreshToken=${adminRefreshToken}; HttpOnly; Secure=false; SameSite=strict`
    // Create a non-admin user for testing
    let nonAdminPayload = { userId: 2, email: 'nonAdmin@example.com', role: 'staff' }
    nonAdminToken = signAccessToken(nonAdminPayload)
  })

  describe('Post /auth/register', () => {
    it('Admin Should register a new analyst user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send(authFactory({ name: 'analyst' }))

      expect(res.status).toBe(201)
    })

    it('Non admin should not create new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send(authFactory({ name: 'staff', email: 'staff@example.com' }))

      expect(res.status).toBe(403)
    })

    it('Should throw error with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send(authFactory({ name: 'admin', email: 'admin@example.com', password: 'Password123' }))

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('This email already exists')
    })

    it('Should throw error with missing data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({ password: 'Password123' })

      expect(res.status).toBe(400)
    })
    it('Should throw error with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({ name: 'admin', password: 'Password123', email: 'invalid@email' })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Validation failed')
    })
    it('Should throw error with invalid password format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({ password: 'password123', email: 'test@example.com' })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Validation failed')
    })
  })

  describe('Login /auth/login', () => {
    it('Should login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@example.com', password: 'Password123' })
      expect(res.status).toBe(200)
    })
    it('Should throw error with missing credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com' })

      expect(res.status).toBe(400)
    })
    it('Should throw error with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'invalid@example.com', password: 'Password123' })

      expect(res.status).toBe(404)
      expect(res.body.message).toBe('User not found')
    })
  })

  describe('Refresh /auth/refresh', () => {
    it('Should return token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [adminSessionCookie])

      expect(res.status).toBe(200)
    })
    it('Should throw error for missing refreshToken', async () => {
      const res = await request(app).post('/api/v1/auth/refresh')

      expect(res.status).toBe(401)
    })
  })
  describe('Logout /auth/logout', () => {
    it('Should logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout').set('Cookie', [adminSessionCookie])

      expect(res.status).toBe(200)
    })
  })
  describe('Profile /auth/me', () => {
    it('Should get profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [adminSessionCookie])
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })
})
