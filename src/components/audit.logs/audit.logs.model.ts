import {
  Table,
  Model,
  DataType,
  Column,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

import { User } from '../../models'

import { AuditType, ACTION_VALUES } from './audit.logs.types'
import type { ActionType } from './audit.logs.types'

type AuditCreateType = Optional<AuditType, 'id' | 'createdAt' | 'updatedAt'>

@Table({ tableName: 'ecommerce_audit_logs', timestamps: true })
export class AuditLog extends Model<AuditType, AuditCreateType> {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare userId: number

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare resource: string

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...ACTION_VALUES),
    defaultValue: 'change',
  })
  declare action: ActionType

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare recordId: number

  @AllowNull(false)
  @Column(DataType.JSON)
  declare changes: Record<string, any>

  @Column(DataType.STRING)
  declare userAgent: string

  @Column(DataType.STRING)
  declare ipAddress: string

  @BelongsTo(() => User)
  user?: User
}
