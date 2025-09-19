import { RolesRepository } from '../../../components/roles/roles.repositories'
import { RolesService } from '../../../components/roles/roles.service'
import { Role } from '../../../models'

describe('RoleService', () => {
  const roleData = { id: 1, name: 'staff' }

  const existingRole = {
    ...roleData,
    $add(permissions: string, list: string[]) {
      this.permissions = list
    },
    $get() {
      return this.users
    },
    save() {
      return jest.fn()
    },
    permissions: [''],
    users: [],
    destroy: jest.fn(),
    update({ name }: { name: string }) {
      this.name = name
    },
  }
  let createSpy = jest
    .spyOn(RolesRepository, 'create')
    .mockResolvedValue(existingRole as unknown as Role)

  let getByNameSpy = jest
    .spyOn(RolesRepository, 'getByName')
    .mockResolvedValue(existingRole as unknown as Role)

  let getByIdSpy = jest
    .spyOn(RolesRepository, 'getById')
    .mockResolvedValue(existingRole as unknown as Role)
  let getAllSpy = jest
    .spyOn(RolesRepository, 'getAll')
    .mockResolvedValue([existingRole] as unknown as Role[])

  describe('Create new Role', () => {
    //create new role
    it('Should create a new role', async () => {
      getByNameSpy = jest.spyOn(RolesRepository, 'getByName').mockResolvedValue(null)
      const role = await RolesService.createRole(roleData.name)
      expect(createSpy).toHaveBeenCalled()
      expect(role.name).toBe('staff')
    })

    it('Should fail to create role for duplicate name', async () => {
      getByNameSpy = jest
        .spyOn(RolesRepository, 'getByName')
        .mockResolvedValue({ id: 1, name: 'staff' } as Role)
      await expect(RolesService.createRole(roleData.name)).rejects.toThrow('Role already exists')
      expect(getByNameSpy).toHaveBeenCalled()
      expect(getByNameSpy).toHaveBeenCalledWith(roleData.name)
    })
  })
  describe('Get role by id', () => {
    it('Should get role by id', async () => {
      const role = await RolesService.getRoleById(1)
      expect(getByIdSpy).toHaveBeenCalled()
      expect(role.name).toBe('staff')
    })
    it('Should fail to get role by id for invalid id', async () => {
      getByIdSpy = jest.spyOn(RolesRepository, 'getById').mockResolvedValue(null)

      await expect(RolesService.getRoleById(999)).rejects.toThrow('Role not found')
      expect(getByIdSpy).toHaveBeenCalled()
    })
  })

  describe('List of roles', () => {
    //get list of roles
    it('Should get all roles', async () => {
      const roles = await RolesService.getAllRoles()

      expect(getAllSpy).toHaveBeenCalled()
      expect(roles).toHaveLength(1)
    })
  })
  describe('Update role', () => {
    //update role
    it('Should update a role', async () => {
      getByIdSpy = jest
        .spyOn(RolesRepository, 'getById')
        .mockResolvedValue({ ...existingRole } as unknown as Role)
      getByNameSpy = jest.spyOn(RolesRepository, 'getByName').mockResolvedValue(null)
      const role = await RolesService.updateRole(1, 'Manager')

      expect(getByIdSpy).toHaveBeenCalled()
      expect(getByIdSpy).toHaveBeenCalledWith(1)
      expect(getByNameSpy).toHaveBeenCalled()
      expect(getByNameSpy).toHaveBeenCalledWith('Manager')
      expect(role.name).toBe('Manager')
    })
    it('Should fail to update role for invalid id', async () => {
      getByIdSpy = jest
        .spyOn(RolesRepository, 'getById')
        .mockResolvedValue(existingRole as unknown as Role)
      getByNameSpy = jest
        .spyOn(RolesRepository, 'getByName')
        .mockResolvedValue(existingRole as unknown as Role)

      await expect(RolesService.updateRole(999, 'Manager')).rejects.toThrow(
        'Role with this name already exists',
      )
      expect(getByIdSpy).toHaveBeenCalled()
      expect(getByIdSpy).toHaveBeenCalledWith(999)
    })
    it('Should fail to update role for duplicate name', async () => {
      getByIdSpy = jest
        .spyOn(RolesRepository, 'getById')
        .mockResolvedValue(existingRole as unknown as Role)
      getByNameSpy = jest
        .spyOn(RolesRepository, 'getByName')
        .mockResolvedValue({ id: 2, name: 'staff' } as unknown as Role)

      await expect(RolesService.updateRole(1, 'staff')).rejects.toThrow(
        'Role with this name already exists',
      )
      expect(getByIdSpy).toHaveBeenCalled()
      expect(getByIdSpy).toHaveBeenCalledWith(1)
      expect(getByNameSpy).toHaveBeenCalled()
      expect(getByNameSpy).toHaveBeenCalledWith('staff')
    })
    it('Should update permissions list', async () => {
      getByIdSpy = jest
        .spyOn(RolesRepository, 'getById')
        .mockResolvedValue(existingRole as unknown as Role)
      getByNameSpy = jest
        .spyOn(RolesRepository, 'getByName')
        .mockResolvedValue(existingRole as unknown as Role)

      const role = await RolesService.updateRole(1, 'staff', ['add product', 'view product'])

      expect(getByIdSpy).toHaveBeenCalled()
      expect(getByIdSpy).toHaveBeenCalledWith(1)
      expect(getByNameSpy).toHaveBeenCalled()
      expect(getByNameSpy).toHaveBeenCalledWith('staff')
      expect(role.permissions).toMatchObject(
        expect.arrayContaining(['add product', 'view product']),
      )
    })
  })

  describe('Delete role', () => {
    it('Should delete role', async () => {
      getByIdSpy = jest
        .spyOn(RolesRepository, 'getById')
        .mockResolvedValue({ ...existingRole, name: 'Manager' } as unknown as Role)

      await RolesService.deleteRole(1)

      expect(getByIdSpy).toHaveBeenCalled()
    })
    it('Should throw error for invalid id', async () => {
      getByIdSpy = jest.spyOn(RolesRepository, 'getById').mockResolvedValue(null)

      await expect(RolesService.deleteRole).rejects.toThrow('Role not found')
      expect(getByIdSpy).toHaveBeenCalled()
    })
    it('Should throw error for building role', async () => {
      getByIdSpy = jest
        .spyOn(RolesRepository, 'getById')
        .mockResolvedValue(existingRole as unknown as Role)

      await expect(RolesService.deleteRole(1)).rejects.toThrow('Cannot delete built-in role')
    })
    it('Should throw error assigned role', async () => {
      getByIdSpy = jest.spyOn(RolesRepository, 'getById').mockResolvedValue({
        ...existingRole,
        name: 'Manager',
        users: [{ id: 1 }],
      } as unknown as Role)

      await expect(RolesService.deleteRole(1)).rejects.toThrow(
        'Cannot delete role assigned to users',
      )
    })
  })
})
