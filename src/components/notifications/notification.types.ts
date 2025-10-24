import { Optional } from 'sequelize'

export const TYPES = ['lowStock', 'newOrder', 'failedPayment', 'reportReady', 'roleChange'] as const
export const METHODS = ['email', 'inApp', 'logOnly'] as const
export type NotificationType = (typeof TYPES)[number]
export type NotificationMethodType = (typeof METHODS)[number]

//setting model types
export interface NotificationSettingType {
  id: number
  userId: number
  type: NotificationType
  method: NotificationMethodType
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export type NotificationSettingCreateType = Optional<
  NotificationSettingType,
  'id' | 'createdAt' | 'updatedAt'
>

//Log model types

export interface NotificationLogType {
  id: number
  userId: number
  type: NotificationType
  title: string
  body?: string
  eventRef?: number
  read: boolean
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}
export type NotificationLogCreateType = Optional<
  NotificationLogType,
  'id' | 'createdAt' | 'updatedAt' | 'body' | 'eventRef' | 'readAt'
>
