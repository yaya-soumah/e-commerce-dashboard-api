import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript'

import { User } from '../../models'

import { TYPES } from './notification.types'
import type {
  NotificationType,
  NotificationLogCreateType,
  NotificationLogType,
} from './notification.types'

@Table({
  tableName: 'ecommerce_Notification_logs',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
})
export class NotificationLog extends Model<NotificationLogType, NotificationLogCreateType> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true, unique: 'userId-type-eventRef' })
  declare userId: number

  @Column({ type: DataType.ENUM(...TYPES), allowNull: false, unique: 'userId-type-eventRef' })
  declare type: NotificationType

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string

  @Column({ type: DataType.TEXT })
  declare body?: string

  @Column({ type: DataType.INTEGER, unique: 'userId-type-eventRef' })
  declare eventRef?: number

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare read: boolean

  @Column({ type: DataType.DATE })
  declare readAt?: Date

  @BelongsTo(() => User, 'userId')
  user?: User
}
