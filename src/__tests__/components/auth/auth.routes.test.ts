import request from 'supertest'

import app from '../../../app'
import { signAccessToken, signRefreshToken } from '../../../utils/jwt.util'

import { authFactory } from './auth.factory'

describe('Auth API', () => {
  let userData: any
  let token: string
  let refreshToken: string
  let sessionCookie: string

  beforeAll(async () => {
    userData = authFactory()
    let payload = { userId: 1, role: 'admin', email: 'test@example.com' }
    token = signAccessToken(payload)
    refreshToken = signRefreshToken(payload)
    sessionCookie = `refreshToken=${refreshToken}; HttpOnly; Secure=false; SameSite=strict`
  })

  describe('Register /auth/register', () => {
    it('Admin Should register a new analyst user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send(userData)

      expect(res.status).toBe(201)
      expect(res.body.data.user.role).toBe('analyst')
    })
    it('Admin Should register a new staff user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send(authFactory({ email: 'test2@example.com', role: 'staff' }))

      expect(res.status).toBe(201)
      expect(res.body.data.user.role).toBe('staff')
    })
    it('Should throw error with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send(authFactory({ email: 'test@example.com', password: 'Password123' }))

      expect(res.status).toBe(400)
    })

    it('Should throw error with missing data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send({ password: 'Password123' })

      expect(res.status).toBe(400)
    })
    it('Should throw error with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send({ password: 'Password123', email: 'invalid@email' })

      expect(res.status).toBe(400)
    })
    it('Should throw error with invalid password format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send({ password: 'password123', email: 'test@example.com' })

      expect(res.status).toBe(400)
    })

    it('Should throw error with invalid role value', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send({ password: 'Password123', email: 'test3@example.com', role: 'invalid' })

      expect(res.status).toBe(400)
    })

    it('Should throw error with non-admin', async () => {
      let payload = { userId: 1, role: 'analyst', email: 'test@example.com' }
      token = signAccessToken(payload)
      refreshToken = signRefreshToken(payload)
      const sessionCookie = `refreshToken=${refreshToken}; HttpOnly; Secure=false; SameSite=strict`
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', [sessionCookie])
        .send(userData)

      expect(res.status).toBe(403)
    })
  })

  describe('Login /auth/login', () => {
    it('Should login', async () => {
      const res = await request(app).post('/api/v1/auth/login').send(userData)

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
      const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', [sessionCookie])

      console.log('refresh: res.body ', res.body)
      expect(res.status).toBe(200)
    })
    it('Should throw error for missing refreshToken', async () => {
      const res = await request(app).post('/api/v1/auth/refresh')

      expect(res.status).toBe(401)
    })
  })
  describe('Logout /auth/logout', () => {
    it('Should logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout').set('Cookie', [sessionCookie])

      expect(res.status).toBe(200)
    })
  })
  describe('Profile /auth/me', () => {
    it('Should get profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [sessionCookie])
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
    })
  })
})
