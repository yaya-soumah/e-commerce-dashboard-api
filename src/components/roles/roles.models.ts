import {
  Model,
  Column,
  Table,
  DataType,
  Unique,
  AllowNull,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript'

import { User } from '../users/user.model'

import { Permission } from './permissions.models'
import { RolePermission } from './rolePermissions.models'

@Table({
  tableName: 'ecommerce_roles',
  timestamps: true,
})
export class Role extends Model {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string

  @HasMany(() => User)
  users?: User[]

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions?: Permission[]
}
