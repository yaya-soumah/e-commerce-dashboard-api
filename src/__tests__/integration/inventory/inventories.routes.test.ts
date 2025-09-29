import request from 'supertest'

import app from '../../../app'
import { generateTokens } from '../../utils/loader'

describe('Inventory API', () => {
  let adminToken: string
  let adminSessionCookie: string

  beforeAll(async () => {
    const { token: adToken, session: adSession } = await generateTokens('admin')
    adminToken = adToken
    adminSessionCookie = adSession
  })

  describe('GET /inventory', async () => {
    const res = await request(app)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Session', adminSessionCookie)
      .get('api/v1/inventory')

    console.log('res.body', res.body)
  })
})
