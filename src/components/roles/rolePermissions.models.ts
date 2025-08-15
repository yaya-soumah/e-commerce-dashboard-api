import { Model, Column, Table, DataType, AllowNull, ForeignKey } from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { Permission } from '../permissions/permissions.models'

import { Role } from './roles.models'

interface RolePermissionAttributes {
  id: number
  roleId: number
  permissionId: number
}

type RolePermissionCreationAttributes = Optional<RolePermissionAttributes, 'id'>

@Table({
  tableName: 'ecommerce_role_permissions',
  timestamps: true,
})
export class RolePermission extends Model<
  RolePermissionAttributes,
  RolePermissionCreationAttributes
> {
  @AllowNull(false)
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number

  @AllowNull(false)
  @ForeignKey(() => Permission)
  @Column(DataType.INTEGER)
  permissionId!: number
}
