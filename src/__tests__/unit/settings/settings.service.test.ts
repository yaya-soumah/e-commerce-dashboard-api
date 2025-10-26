import { SettingService } from '../../../components/settings/settings.service'
import { loadSettings } from '../../../utils/settings-cache'
import { Setting } from '../../../models'
import type { TYPES } from '../../../components/settings/settings.type'

describe('SettingService', () => {
  beforeAll(async () => {
    // Seed defaults
    const defaults = [
      {
        key: 'currency',
        value: { value: 'USD' },
        type: 'string' as TYPES,
        category: 'general',
        description: 'ISO currency code',
      },
      {
        key: 'taxRate',
        value: { value: 0.1 },
        type: 'number' as TYPES,
        category: 'orders',
        description: 'Tax rate as decimal',
      },
      {
        key: 'lowStockThreshold',
        value: { value: 10 },
        type: 'number' as TYPES,
        category: 'inventory',
        description: 'Default stock threshold',
      },
      {
        key: 'dailyReportTime',
        value: { value: '09:00' },
        type: 'time' as TYPES,
        category: 'reporting',
        description: 'Daily report cron time (HH:mm)',
      },
      {
        key: 'publicRegistration',
        value: { value: true },
        type: 'boolean' as TYPES,
        category: 'auth',
        description: 'Allow public signups',
      },
      {
        key: 'maxUploadSizeMB',
        value: { value: 2 },
        type: 'number' as TYPES,
        category: 'files',
        description: 'Max file upload size',
      },
      {
        key: 'orderAutoCancelHours',
        value: { value: 24 },
        type: 'number' as TYPES,
        category: 'orders',
        description: 'Hours for auto-cancel unpaid orders',
      },
    ]
    await Setting.bulkCreate(defaults)
  })

  it('loads default settings when DB is empty', async () => {
    await loadSettings()
    const settings = await SettingService.getAll()
    expect(settings.get('currency')).toBe('USD')
  })

  it('validates taxRate range', async () => {
    await expect(SettingService.update('taxRate', 1.5)).rejects.toThrow()
  })

  it('updates boolean setting correctly', async () => {
    await SettingService.update('publicRegistration', false)
    expect(SettingService.get('publicRegistration')).toBe(false)
  })
})
