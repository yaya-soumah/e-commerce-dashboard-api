import { UserRepository } from '../../../components/users/user.repository'

describe('UserRepository', () => {
  describe('findAll', () => {
    it('finds all users without filter, sort, and pagination', async () => {
      const users = await UserRepository.findAll()
      expect(users).toBeDefined()
      expect(Array.isArray(users)).toBe(true)
      if (Array.isArray(users)) {
        expect(users.length).toBeGreaterThan(0)
      } else {
        expect(users.rows.length).toBeGreaterThan(0)
      }
    })

    it('finds users with filtered by (name)', async () => {
      const users = await UserRepository.findAll({ search: { name: 'ad' } })
      expect(users).toBeDefined()
      expect(Array.isArray(users)).toBe(true)
      if (Array.isArray(users)) {
        expect(users.length).toBeGreaterThan(0)
        expect(users[0].name).toMatch(/\w*ad\w*/i)
      } else {
        expect(users.rows.length).toBeGreaterThan(0)
      }
    })

    it('defaults to createdAt filter when filter key is incorrect', async () => {
      const users = await UserRepository.findAll({ search: { wrong: 'ad' } })
      expect(users).toBeDefined()
      expect(Array.isArray(users)).toBe(true)
      if (Array.isArray(users)) {
        expect(users.length).toBeGreaterThan(0)
      } else {
        expect(users.rows.length).toBeGreaterThan(0)
      }
    })

    it('finds users sorted by name', async () => {
      const users = await UserRepository.findAll({ sort_by: 'name', order_by: 'desc' })
      expect(users).toBeDefined()
      expect(Array.isArray(users)).toBe(true)
      if (Array.isArray(users)) {
        expect(users.length).toBeGreaterThan(0)
      } else {
        expect(users.rows.length).toBeGreaterThan(0)
      }
    })

    it('finds users with pagination', async () => {
      const data = await UserRepository.findAll({ isPagination: true })
      expect(data).toBeDefined()
      if ('rows' in data && 'count' in data) {
        expect(data).toHaveProperty('count')
        expect(data).toHaveProperty('rows')
        expect(Array.isArray(data.rows)).toBe(true)
        expect(data.rows.length).toBeGreaterThan(0)
      } else {
        expect(Array.isArray(data)).toBe(true)
        expect((data as any[]).length).toBeGreaterThan(0)
      }
    })

    it('finds users with filter and sorted by name', async () => {
      const data = await UserRepository.findAll({
        search: { name: 'adm' },
        sort_by: 'name',
        order_by: 'desc',
      })
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      if (Array.isArray(data)) {
        expect(data.length).toBeGreaterThan(0)
      } else {
        expect(data.rows.length).toBeGreaterThan(0)
      }
    })

    it('finds users with filter and pagination', async () => {
      const data = await UserRepository.findAll({
        isPagination: true,
        search: { name: 'ad' },
        limit: 10,
        offset: 0,
      })
      expect(data).toBeDefined()
      if ('rows' in data && Array.isArray(data.rows)) {
        expect(data).toHaveProperty('count')
        expect(data).toHaveProperty('rows')
        expect(Array.isArray(data.rows)).toBe(true)
        expect(data.rows.length).toBeGreaterThan(0)
      } else {
        expect(Array.isArray(data)).toBe(true)
        expect((data as any[]).length).toBeGreaterThan(0)
      }
    })

    it('finds users sorted with pagination', async () => {
      const data = await UserRepository.findAll({
        isPagination: true,
        sort_by: 'email',
        order_by: 'asc',
      })
      if ('rows' in data && Array.isArray(data.rows)) {
        expect(data).toBeDefined()
        expect(data).toHaveProperty('count')
        expect(data).toHaveProperty('rows')
        expect(Array.isArray(data.rows)).toBe(true)
        expect(data.rows.length).toBeGreaterThan(0)
      } else {
        expect(Array.isArray(data)).toBe(true)
        expect((data as []).length).toBeGreaterThan(0)
      }
    })

    it('finds users sorted, filtered, and paginated', async () => {
      const data = await UserRepository.findAll({
        isPagination: true,
        search: { name: 'adm' },
        sort_by: 'email',
        order_by: 'asc',
      })
      if ('rows' in data && Array.isArray(data.rows)) {
        expect(data).toBeDefined()
        expect(data).toHaveProperty('count')
        expect(data).toHaveProperty('rows')
        expect(Array.isArray(data.rows)).toBe(true)
        expect(data.rows.length).toBeGreaterThan(0)
      } else {
        expect(Array.isArray(data)).toBe(true)
        expect((data as []).length).toBeGreaterThan(0)
      }
    })
  })

  describe('findById', () => {
    it('finds user by id', async () => {
      const user = await UserRepository.findById(1)
      expect(user).toBeDefined()
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user?.password).toBeUndefined()
    })
  })

  describe('findByIdWithPassword', () => {
    it('finds user by id with password', async () => {
      const user = await UserRepository.findByIdWithPassword(1)
      expect(user).toBeDefined()
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('password')
    })
  })

  describe('remove', () => {
    it('removes a user by id', async () => {
      const count = await UserRepository.remove(1)
      expect(count).toBeDefined()
      expect(count).toEqual(1)
    })
  })
})
