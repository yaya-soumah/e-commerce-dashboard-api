import {
  Model,
  Table,
  Column,
  DataType,
  Unique,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript'

import { Role } from '../roles/roles.models'

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  ANALYST = 'analyst',
}

@Table({
  tableName: 'ecommerce_users',
  timestamps: true,
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: {
    addPassword: { attributes: { include: ['password'] } },
  },
})
export class User extends Model {
  @Column(DataType.STRING)
  name?: string

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string

  @AllowNull(false)
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number

  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'blocked'))
  status?: string

  @Column(DataType.STRING)
  avatar?: string

  @BelongsTo(() => Role)
  role?: Role
}
