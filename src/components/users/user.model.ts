import { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, Table, Column, DataType, Unique, AllowNull, Default } from 'sequelize-typescript'

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
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
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
  isBlocked?: boolean
}
