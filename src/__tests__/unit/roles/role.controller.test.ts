import { Request, Response } from 'express'

import { RolesController } from '../../../components/roles/roles.controller'
import { RolesService } from '../../../components/roles/roles.service'
import { Role } from '../../../models'
import mockHttp from '../../utils/http'

describe('Role Controller', () => {
  const roleData = { id: 1, name: 'admin' } as Role
  const createRoleSpy = jest.spyOn(RolesService, 'createRole').mockResolvedValue(roleData)
  const getAllRolesSpy = jest.spyOn(RolesService, 'getAllRoles').mockResolvedValue([roleData])
  const updateRoleSpy = jest.spyOn(RolesService, 'updateRole').mockResolvedValue(roleData)
  const deleteRoleSpy = jest.spyOn(RolesService, 'deleteRole').mockResolvedValue()
  const res = mockHttp.response() as Response

  describe('Roles List', () => {
    it('Should get all roles', async () => {
      const req = mockHttp.request({}) as Request
      await RolesController.getAllRoles(req, res)

      expect(getAllRolesSpy).toHaveBeenCalled()
    })
  })
  describe('Create Role', () => {
    it('Should create a new role', async () => {
      const req = mockHttp.request({ body: { name: 'staff' } }) as Request
      await RolesController.createRole(req, res)

      expect(createRoleSpy).toHaveBeenCalled()
      expect(createRoleSpy).toHaveBeenCalledWith('staff')
    })
  })

  describe('Update role', () => {
    it('Should update role', async () => {
      const req = mockHttp.request({
        body: { name: 'admin', permissions: ['view product list'] },
        params: { roleId: 1 },
      }) as Request
      await RolesController.updateRole(req, res)

      expect(updateRoleSpy).toHaveBeenCalled()
      expect(updateRoleSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'admin',
        expect.arrayContaining(['view product list']),
      )
    })
    describe('Delete Role', () => {
      it('Should delete role', async () => {
        const req = mockHttp.request({ params: { roleId: 1 } }) as Request
        await RolesController.deleteRole(req, res)

        expect(deleteRoleSpy).toHaveBeenCalled()
        expect(deleteRoleSpy).toHaveBeenCalledWith(expect.any(Number))
      })
    })
  })
})
