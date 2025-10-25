import { Optional } from 'sequelize'

export const TYPE_VALUES = ['string', 'number', 'boolean', 'time'] as const
export type TYPES = (typeof TYPE_VALUES)[number]
export interface SettingsType {
  id: number
  key: string
  value: { value: string | number | boolean }
  type: TYPES
  category?: string
  description?: string
}

export type SettingsCreateType = Optional<SettingsType, 'id'>
