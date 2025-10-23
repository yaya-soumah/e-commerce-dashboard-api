import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript'

import { User } from '../../models'

import type {
  NotificationType,
  NotificationSettingType,
  NotificationSettingCreateType,
  NotificationMethodType,
} from './notification.types'
import { TYPES, METHODS } from './notification.types'

@Table({ tableName: 'ecommerce_notification_settings', timestamps: true })
export class NotificationSetting extends Model<
  NotificationSettingType,
  NotificationSettingCreateType
> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    unique: 'unique_user_type',
    allowNull: false,
  })
  declare userId: number

  @Column({ type: DataType.ENUM(...TYPES), allowNull: false, unique: 'unique_user_type' })
  declare type: NotificationType

  @Column({ type: DataType.ENUM(...METHODS), defaultValue: 'inApp' })
  declare method: NotificationMethodType

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare enabled: boolean

  @BelongsTo(() => User, 'userId')
  user?: User
}
