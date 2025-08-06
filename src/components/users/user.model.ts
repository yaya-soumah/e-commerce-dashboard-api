import { InferAttributes, InferCreationAttributes } from 'sequelize'
import {
  Model,
  Table,
  Column,
  DataType,
  PrimaryKey,
  Unique,
  AllowNull,
  Default,
} from 'sequelize-typescript'

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  ANALYST = 'analyst',
}

@Table({ tableName: 'ecommerce_users', timestamps: true })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id!: number

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string

  @Default(UserRole.ANALYST)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: string

  @Default(false)
  @Column(DataType.BOOLEAN)
  isBlocked!: boolean
}
