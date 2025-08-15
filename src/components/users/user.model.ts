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
import { Optional } from 'sequelize'

import { Role } from '../roles/roles.models'

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  ANALYST = 'analyst',
}

interface UserAttributes {
  id: number
  name: string
  email: string
  password: string
  roleId: number
  status?: string
  avatar?: string
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'status' | 'avatar'>
export type { UserAttributes, UserCreationAttributes }

@Table({
  tableName: 'ecommerce_users',
  timestamps: true,
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: {
    addPassword: { attributes: { include: ['password'] } },
  },
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
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
