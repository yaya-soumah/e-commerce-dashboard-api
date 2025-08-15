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
import { Optional } from 'sequelize'

import { User } from '../users/user.model'
import { Permission } from '../permissions/permissions.models'

import { RolePermission } from './rolePermissions.models'

interface RoleAttributes {
  id: number
  name: string
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id'>

export type { RoleAttributes, RoleCreationAttributes }

@Table({
  tableName: 'ecommerce_roles',
  timestamps: true,
})
export class Role extends Model<RoleAttributes, RoleCreationAttributes> {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string

  @HasMany(() => User)
  users?: User[]

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions?: Permission[]
}
