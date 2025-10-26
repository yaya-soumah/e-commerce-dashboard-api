import { string, z } from 'zod'

import { TYPES, TYPE_VALUES } from './settings.type'

export const SYSTEM_SETTINGS: Record<
  string,
  {
    type: TYPES
    min?: number
    max?: number
    default: any
    category?: string
    description?: string
  }
> = {
  currency: {
    type: 'string',
    default: 'USD',
    category: 'general',
    description: 'ISO currency code',
  },
  taxRate: {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.12,
    category: 'orders',
    description: 'Tax rate between 0 and 1',
  },
  lowStockThreshold: {
    type: 'number',
    min: 0,
    default: 5,
    category: 'inventory',
    description: 'Low stock threshold',
  },
  dailyReportTime: {
    type: 'time',
    default: '08:00',
    category: 'reporting',
    description: 'Daily report time',
  },
  publicRegistration: {
    type: 'boolean',
    default: true,
    category: 'auth',
    description: 'Allow user signup',
  },
  maxUploadSizeMB: {
    type: 'number',
    min: 1,
    max: 50,
    default: 2,
    category: 'files',
    description: 'Upload size in MB',
  },
  orderAutoCancelHours: {
    type: 'number',
    min: 1,
    max: 168,
    default: 24,
    category: 'orders',
    description: 'Auto-cancel unpaid orders after X hours',
  },
}

export type SettingKey = keyof typeof SYSTEM_SETTINGS

export function validateSetting(
  key: string,
  value: any,
  type: string,
): { isValid: boolean; parsed?: any; error?: string } {
  if (!SYSTEM_SETTINGS[key]) return { isValid: false, error: 'Invalid key' }
  const schema = SYSTEM_SETTINGS[key]
  if (schema.type !== type) return { isValid: false, error: 'Type mismatch' }

  let parsed = value
  switch (type) {
    case 'number':
      parsed = parseFloat(value)
      if (isNaN(parsed)) return { isValid: false, error: 'Not a number' }
      if (schema.min !== undefined && parsed < schema.min)
        return { isValid: false, error: `Min ${schema.min}` }
      if (schema.max !== undefined && parsed > schema.max)
        return { isValid: false, error: `Max ${schema.max}` }
      break
    case 'boolean':
      parsed = value === 'true' || value === true
      break
    case 'time':
      if (!/^\d{2}:\d{2}$/.test(value)) return { isValid: false, error: 'Invalid time (HH:mm)' }
      break
  }
  return { isValid: true, parsed }
}

export const SettingParamsSchema = z.object({
  key: string(),
})

export const SettingBodySchema = z.object({
  value: z.json().optional(),
  key: z.enum(TYPE_VALUES).optional(),
})
