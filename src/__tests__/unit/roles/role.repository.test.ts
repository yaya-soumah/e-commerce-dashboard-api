import { RolesRepository } from '../../../components/roles/roles.repositories'

describe('Role Repository', () => {
  const roleData = { name: 'staff' }

  it('Should create a new role', async () => {
    const role = await RolesRepository.create(roleData)

    expect(role).toBeDefined()
    expect(role.name).toBe('staff')
  })

  it('Should get role by name', async () => {
    const role = await RolesRepository.getByName('admin')

    expect(role).toBeDefined()
    expect(role?.name).toBe('admin')
  })
  it('Should get role by name or create a new role', async () => {
    const role = await RolesRepository.getOrCreate('analyst')

    expect(role).toBeDefined()
    expect(role?.name).toBe('analyst')
  })
  it('Should get role by id', async () => {
    const role = await RolesRepository.getById(1)

    expect(role).toBeDefined()
    expect(role?.name).toBe('admin')
  })

  it('Should get all roles', async () => {
    const roles = await RolesRepository.getAll()

    expect(roles).toHaveLength(3)
  })
})
