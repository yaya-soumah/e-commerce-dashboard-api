import request from 'supertest'

import { generateTokens } from '../../utils/loader'
import app from '../../../app'
import { Order, Product, Category, OrderItem, Payment, Inventory } from '../../../models'
import { generateSlug } from '../../../utils/slag'

describe('Admin Dashboard API', () => {
  let adminToken: string
  let adminCookie: string
  let analystToken: string
  let analystCookie: string
  let staffToken: string
  let staffCookie: string
  let productId: number
  let categoryId: number

  beforeAll(async () => {
    const { token: adToken, session: adSession, user: admin } = await generateTokens('admin')
    const { token: anToken, session: anSession } = await generateTokens('analyst')
    const { token: stToken, session: stSession } = await generateTokens('staff')

    adminToken = adToken
    adminCookie = adSession

    analystToken = anToken
    analystCookie = anSession

    staffToken = stToken
    staffCookie = stSession

    //create a new product
    const category = await Category.create({
      name: 'Smartphones',
      description: 'Mobile phones',
      slug: generateSlug('Smartphones'),
    })
    categoryId = category.id
    // Seed product
    const product = await Product.create({
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      status: 'active',
      lowStockLevel: 0,
      stock: 100,
      sku: 'TEST-001',
      categoryId,
      tags: ['test'],
      images: ['https://example.com/test.jpg'],
    })
    productId = product.id

    //create inventory
    await Inventory.create({
      productId,
      stock: 20,
      lowStockLevel: 5,
      stockThreshold: 10,
    })

    // Seed orders with payments
    const order1 = await Order.create({
      orderNumber: 'ORD-TEST-001',
      customerName: 'Test User 1',
      subtotal: 99.99,
      tax: 9.99,
      total: 109.98,
      shippingAddress: 'Test Address 1',
      status: 'pending',
      paymentStatus: 'paid',
      notes: '',
      userId: admin!.id,
    })
    await OrderItem.create({
      orderId: order1.id,
      productId,
      quantity: 1,
      unitPrice: 99.99,
      totalPrice: 99.99,
    })
    await Payment.create({
      orderId: order1.id,
      status: 'paid',
      method: 'credit_card',
      amount: 109.98,
      paidAt: new Date('2025-10-16'),
    })
    const order2 = await Order.create({
      orderNumber: 'ORD-TEST-002',
      customerName: 'Test User 2',
      subtotal: 199.98,
      tax: 19.99,
      total: 219.97,
      shippingAddress: 'Test Address 2',
      status: 'pending',
      paymentStatus: 'paid',
      notes: '',
      userId: admin!.id,
    })
    await OrderItem.create({
      orderId: order2.id,
      productId,
      quantity: 2,
      unitPrice: 99.99,
      totalPrice: 199.98,
    })
    await Payment.create({
      orderId: order2.id,
      status: 'paid',
      method: 'credit_card',
      amount: 219.97,
      paidAt: new Date('2025-10-15'),
    })
    const order3 = await Order.create({
      orderNumber: 'ORD-TEST-003',
      customerName: 'Test User 3',
      subtotal: 199.98,
      tax: 19.99,
      total: 219.97,
      shippingAddress: 'Test Address 3',
      status: 'shipped',
      paymentStatus: 'paid',
      notes: '',
      userId: admin!.id,
    })
    await OrderItem.create({
      orderId: order3.id,
      productId,
      quantity: 10,
      unitPrice: 99.99,
      totalPrice: 999.9,
    })
    await Payment.create({
      orderId: order3.id,
      status: 'paid',
      method: 'credit_card',
      amount: 1000,
      paidAt: new Date('2025-10-17'),
    })
    //cancelled order
    await Order.create({
      orderNumber: 'ORD-TEST-003',
      customerName: 'Test User 3',
      subtotal: 199.98,
      tax: 19.99,
      total: 219.97,
      shippingAddress: 'Test Address 3',
      status: 'cancelled',
      paymentStatus: 'refunded',
      notes: '',
      userId: admin!.id,
    })
  })

  it('should get today metrics', async () => {
    const res = await request(app)
      .get('/api/v1/metrics')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', [adminCookie])

    console.log('res.body****', res.body)

    expect(res.status).toBe(200)
  })

  it('should allow analyst to view metrics', async () => {
    const res = await request(app)
      .get('/api/v1/metrics')
      .set('Authorization', `Bearer ${analystToken}`)
      .set('Cookie', [analystCookie])

    expect(res.status).toBe(200)
  })
  it('should not allow staff to view metrics', async () => {
    const res = await request(app)
      .get('/api/v1/metrics')
      .set('Authorization', `Bearer ${staffToken}`)
      .set('Cookie', [staffCookie])

    console.log('res.body', res.body)
    expect(res.status).toBe(403)
  })
})
