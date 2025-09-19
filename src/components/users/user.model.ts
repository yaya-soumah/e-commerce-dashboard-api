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
  declare name?: string

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string

  @AllowNull(false)
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  declare roleId: number

  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'blocked'))
  declare status?: string

  @Column(DataType.STRING)
  declare avatar?: string

  @BelongsTo(() => Role)
  role?: Role
}
