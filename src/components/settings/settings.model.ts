import { Table, Column, Model, DataType } from 'sequelize-typescript'

import { TYPE_VALUES } from './settings.type'
import type { TYPES, SettingsAttributes, SettingsCreationAttributes } from './settings.type'

@Table({ tableName: 'Settings', timestamps: true })
export class Setting extends Model<SettingsAttributes, SettingsCreationAttributes> {
  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  declare key: string

  @Column({ type: DataType.JSONB, allowNull: false })
  declare value: Record<string, string | number | boolean>

  @Column({ type: DataType.ENUM(...TYPE_VALUES) })
  declare type: TYPES

  @Column({ type: DataType.STRING(50) })
  declare category?: string

  @Column({ type: DataType.TEXT })
  declare description?: string
}
