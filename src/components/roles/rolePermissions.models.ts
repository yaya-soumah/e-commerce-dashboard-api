import {
  Model,
  Column,
  Table,
  DataType,
  PrimaryKey,
  AllowNull,
  ForeignKey,
} from 'sequelize-typescript'
import { InferAttributes, InferCreationAttributes } from 'sequelize'

import { Role } from './roles.models'
import { Permission } from './permissions.models'

@Table({
  tableName: 'ecommerce_role_permissions',
  timestamps: true,
})
export class RolePermission extends Model<
  InferAttributes<RolePermission>,
  InferCreationAttributes<RolePermission>
> {
  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.INTEGER)
  id!: number

  @AllowNull(false)
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number

  @AllowNull(false)
  @ForeignKey(() => Permission)
  @Column(DataType.INTEGER)
  permissionId!: number
}
