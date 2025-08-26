import { Request, Response } from 'express'

import { PermissionsController } from '../../../components/permissions/permissions.controller'
import { PermissionsService } from '../../../components/permissions/permissions.service'
import { Permission } from '../../../models'
import mockHttp from '../../utils/http'

describe('Permission Controller', () => {
  const permissionData = {
    id: 1,
    key: 'user:create',
    description: 'Create users',
  } as Permission

  let getAllPermissionsSpy = jest
    .spyOn(PermissionsService, 'getAllPermissions')
    .mockResolvedValue([permissionData])
  let getPermissionByIdSpy = jest
    .spyOn(PermissionsService, 'getPermissionById')
    .mockResolvedValue(permissionData)
  let createPermissionSpy = jest
    .spyOn(PermissionsService, 'createPermission')
    .mockResolvedValue(permissionData)
  let updatePermissionSpy = jest
    .spyOn(PermissionsService, 'updatePermission')
    .mockResolvedValue(permissionData)

  const res = mockHttp.response() as Response

  describe('Get all permissions', () => {
    it('Should get list of permissions', async () => {
      const req = mockHttp.request({}) as Request
      await PermissionsController.getAllPermissions(req, res)

      expect(getAllPermissionsSpy).toHaveBeenCalled()
    })
  })
  describe('Get permission by id', () => {
    it('Should permission by id', async () => {
      const req = mockHttp.request({ params: { id: 1 } }) as Request
      await PermissionsController.getPermissionById(req, res)

      expect(getPermissionByIdSpy).toHaveBeenCalled()
      expect(getPermissionByIdSpy).toHaveBeenCalledWith(1)
    })
  })
  describe('Create permission', () => {
    it('Should create a permission', async () => {
      const req = mockHttp.request({
        body: { key: 'user:create', description: 'Create users' },
      }) as Request
      await PermissionsController.createPermission(req, res)

      expect(createPermissionSpy).toHaveBeenCalled()
      expect(createPermissionSpy).toHaveBeenCalledWith({
        key: 'user:create',
        description: 'Create users',
      })
    })
  })
  describe('Update permission', () => {
    it('Should update a permission', async () => {
      const req = mockHttp.request({
        params: { id: 1 },
        body: { key: 'user:create', description: 'Create users' },
      }) as Request
      await PermissionsController.updatePermission(req, res)

      expect(updatePermissionSpy).toHaveBeenCalled()
      expect(updatePermissionSpy).toHaveBeenCalledWith(1, {
        key: 'user:create',
        description: 'Create users',
      })
    })
  })
})
