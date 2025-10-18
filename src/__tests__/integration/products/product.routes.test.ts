import request from 'supertest'

import app from '../../../app'
import { Permission, Product, Category } from '../../../models'
import { generateSlug } from '../../../utils/slag'
import { generateTokens } from '../../utils/loader'

describe('Product Component', () => {
  let adminToken: string
  let adminSessionCookie: string
  let staffToken: string
  let staffSessionCookie: string
  let analystToken: string
  let analystSessionCookie: string
  let categoryId: number

  beforeAll(async () => {
    // Seed permissions
    const permissions = [
      { key: 'product:create', description: 'Create products' },
      { key: 'product:update', description: 'Update products' },
      { key: 'product:delete', description: 'Delete products' },
      { key: 'product:view', description: 'View products' },
    ]
    for (const perm of permissions) {
      await Permission.create(perm)
    }

    let {
      token: adToken,
      session: adSessionCookies,
      role: adminRole,
    } = await generateTokens('admin')
    let {
      token: stToken,
      session: stSessionCookies,
      role: staffRole,
    } = await generateTokens('staff')
    let {
      token: anToken,
      session: anSessionCookies,
      role: analystRole,
    } = await generateTokens('analyst')

    adminToken = adToken
    adminSessionCookie = adSessionCookies
    staffToken = stToken
    staffSessionCookie = stSessionCookies
    analystToken = anToken
    analystSessionCookie = anSessionCookies

    await adminRole!.$set('permissions', await Permission.findAll())
    await staffRole!.$set(
      'permissions',
      await Permission.findAll({
        where: { key: ['product:create', 'product:update', 'product:delete', 'product:view'] },
      }),
    )
    await analystRole!.$set(
      'permissions',
      await Permission.findAll({ where: { key: ['product:view'] } }),
    )

    // Seed category with parent
    const parentCategory = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices',
      slug: generateSlug('Electronics'),
    })
    const category = await Category.create({
      name: 'Smartphones',
      description: 'Mobile phones',
      slug: generateSlug('Smartphones'),
      parentId: parentCategory.id,
    })
    categoryId = category.id
  })
  describe('POST /products', () => {
    it('should allow admin to create a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({
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
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.name).toBe('Test Product')
      expect(res.body.data.slug).toBe(generateSlug('Test Product'))
      expect(res.body.data.category.slug).toBe('smartphones')
    })

    it('should allow staff to create a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffSessionCookie])
        .send({
          name: 'Staff Product',
          description: 'A staff-created product',
          price: 49.99,
          status: 'draft',
          lowStockLevel: 0,
          stock: 100,
          sku: 'STAFF-001',
          categoryId,
          tags: ['staff'],
          images: ['https://example.com/staff.jpg'],
        })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.name).toBe('Staff Product')
      expect(res.body.data.tags[0].slug).toBe('staff')
    })

    it('should prevent analyst from creating a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystSessionCookie])
        .send({
          name: 'Analyst Product',
          description: 'Should fail',
          price: 29.99,
          status: 'active',
          lowStockLevel: 0,
          stock: 100,
          categoryId,
        })

      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Forbidden: insufficient permission')
    })

    it('should failed to create duplicate name', async () => {
      await Product.create({
        name: 'Unique Product',
        description: 'First product',
        price: 29.99,
        status: 'active',
        sku: 'UNIQUE-001',
        lowStockLevel: 0,
        stock: 100,
        categoryId,
      })

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({
          name: 'Unique Product',
          description: 'Second product with same name',
          price: 39.99,
          status: 'active',
          lowStockLevel: 0,
          stock: 20,
          sku: 'UNIQUE-002',
          categoryId,
        })
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Name must be unique')
    })

    it('should failed to create product for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({
          name: '',
          price: -10,
          lowStockLevel: 0,
          stock: -5,
          status: 'invalid',
          categoryId: 999,
        })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })
  })

  describe('GET /products', () => {
    it('should list products with filters', async () => {
      // clear the product
      await Product.destroy({ where: {} })
      await Product.create({
        name: 'Filter Product',
        description: 'A product for filtering',
        price: 59.99,
        status: 'active',
        lowStockLevel: 0,
        stock: 50,
        sku: 'FILTER-001',
        categoryId,
      })

      const res = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystSessionCookie])
        .query({ name: 'Filter', status: 'active', page: 1, limit: 10 })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].name).toBe('Filter Product')
    })
  })

  describe('GET /products/:id', () => {
    it('should get product by ID', async () => {
      const product = await Product.create({
        name: 'Detail Product',
        description: 'A product for detail view',
        price: 79.99,
        status: 'active',
        lowStockLevel: 0,
        stock: 100,
        sku: 'DETAIL-001',
        categoryId,
      })

      const res = await request(app)
        .get(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${analystToken}`)
        .set('Cookie', [analystSessionCookie])

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.name).toBe('Detail Product')
      expect(res.body.data.category.slug).toBe('smartphones')
    })
  })

  describe('PATCH /products/:id', () => {
    it('should allow admin to update a product', async () => {
      const product = await Product.create({
        name: 'Update Product',
        description: 'A product to update',
        price: 89.99,
        status: 'draft',
        lowStockLevel: 0,
        stock: 100,
        sku: 'UPDATE-001',
        categoryId,
      })

      const res = await request(app)
        .patch(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Cookie', [adminSessionCookie])
        .send({ description: 'An Updated Product', price: 99.99 })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.description).toBe('An Updated Product')
    })
  })

  describe('DELETE /products/:id', () => {
    it('should allow staff to delete a product', async () => {
      const product = await Product.create({
        name: 'Delete Product',
        description: 'A product to delete',
        price: 69.99,
        status: 'active',
        lowStockLevel: 0,
        stock: 100,
        sku: 'DELETE-001',
        categoryId,
      })

      const res = await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .set('Cookie', [staffSessionCookie])

      expect(res.status).toBe(204)
    })
  })
})
