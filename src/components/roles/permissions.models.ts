import {
  Model,
  Column,
  Table,
  DataType,
  Unique,
  AllowNull,
  BelongsToMany,
} from 'sequelize-typescript'

import { Role } from './roles.models'
import { RolePermission } from './rolePermissions.models'

@Table({ tableName: 'ecommerce_permissions', timestamps: true })
export class Permission extends Model {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  key!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  description!: string

  @BelongsToMany(() => Role, () => RolePermission)
  roles?: Role[]
}
