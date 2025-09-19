import {
  Model,
  Column,
  Table,
  DataType,
  Unique,
  AllowNull,
  BelongsToMany,
} from 'sequelize-typescript'

import { Role } from '../roles/roles.models'
import { RolePermission } from '../roles/rolePermissions.models'

interface PermissionAttributes {
  id: number
  key: string
  description: string
}

type PermissionCreationAttributes = Omit<PermissionAttributes, 'id'>

@Table({ tableName: 'ecommerce_permissions', timestamps: true })
export class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare key: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare description: string

  @BelongsToMany(() => Role, () => RolePermission)
  roles?: Role[]
}
