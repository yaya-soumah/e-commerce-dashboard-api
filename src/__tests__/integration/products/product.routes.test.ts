import request from 'supertest'

import app from '../../../app'
import { User, Role, Permission, Product, Category } from '../../../models'
import { signRefreshToken, signAccessToken } from '../../../utils/jwt.util'
import { parse } from '../../../utils/bcrypt.util'
import { generateSlug } from '../../../utils/slag'

describe('Product Component', () => {
  let adminToken: string
  let adminRefreshToken: string
  let adminSessionCookie: string
  let staffToken: string
  let staffRefreshToken: string
  let staffSessionCookie: string
  let analystToken: string
  let analystRefreshToken: string
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

    // Seed roles
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } })
    const staffRole = await Role.create({ name: 'staff' })
    const analystRole = await Role.create({ name: 'analyst' })

    await adminRole.$set('permissions', await Permission.findAll())
    await staffRole.$set(
      'permissions',
      await Permission.findAll({
        where: { key: ['product:create', 'product:update', 'product:delete', 'product:view'] },
      }),
    )
    await analystRole.$set(
      'permissions',
      await Permission.findAll({ where: { key: ['product:view'] } }),
    )

    // Seed users
    const adminUser = await User.create({
      name: 'admin2',
      email: 'admin2@example.com',
      password: await parse('Admin1234'),
      roleId: adminRole.id,
    })
    const staffUser = await User.create({
      name: 'staff',
      email: 'staff@example.com',
      password: await parse('Staff1234'),
      roleId: staffRole.id,
    })
    const analystUser = await User.create({
      name: 'analyst',
      email: 'analyst@example.com',
      password: await parse('Analyst1234'),
      roleId: analystRole.id,
    })

    //admin token
    adminToken = signAccessToken({
      userId: adminUser.id,
      email: adminUser.email,
      roleName: 'admin',
    })
    adminRefreshToken = signRefreshToken({
      userId: adminUser.id,
      email: adminUser.email,
      roleName: 'admin',
    })
    adminSessionCookie = `refreshToken=${adminRefreshToken}; HttpOnly; Secure=false; SameSite=strict`

    //staff token
    staffToken = signAccessToken({
      userId: staffUser.id,
      email: staffUser.email,
      roleName: 'staff',
    })
    staffRefreshToken = signRefreshToken({
      userId: staffUser.id,
      email: staffUser.email,
      roleName: 'staff',
    })
    staffSessionCookie = `refreshToken=${staffRefreshToken}; HttpOnly; Secure=false; SameSite=strict`

    //analyst token
    analystToken = signAccessToken({
      userId: analystUser.id,
      email: analystUser.email,
      roleName: 'analyst',
    })
    analystRefreshToken = signRefreshToken({
      userId: analystUser.id,
      email: analystUser.email,
      roleName: 'analyst',
    })
    analystSessionCookie = `refreshToken=${analystRefreshToken}; HttpOnly; Secure=false; SameSite=strict`

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
          stock: 50,
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
          stock: 10,
          categoryId,
        })

      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Access denied: insufficient role')
    })

    it('should failed to create duplicate name', async () => {
      await Product.create({
        name: 'Unique Product',
        description: 'First product',
        price: 29.99,
        status: 'active',
        stock: 10,
        sku: 'UNIQUE-001',
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
        stock: 20,
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
        stock: 30,
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
        stock: 40,
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
        stock: 50,
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
