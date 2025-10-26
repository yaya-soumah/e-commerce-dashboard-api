import { AppError } from '../../utils/app-error.util'
import { updateCache, getSetting, SETTINGS } from '../../utils/settings-cache'

import { SettingRepository } from './settings.repository'
import { validateSetting, SYSTEM_SETTINGS } from './settings.schema'
import type { SettingKey } from './settings.schema'

export class SettingService {
  static async getAll(): Promise<Record<string, any>> {
    return SETTINGS
  }

  static get(key: SettingKey): any {
    return getSetting(key)
  }

  static async update(key: string, value: any): Promise<any> {
    const meta = SYSTEM_SETTINGS[key]
    if (!meta) throw new AppError(`Invalid setting key: ${key}`, 400)

    const { isValid, parsed, error } = validateSetting(key, value, meta.type)
    if (!isValid) throw new AppError(error || 'Validation failed', 400)
    const updated = await SettingRepository.upsert(key, { value: parsed })

    updateCache(key, parsed)
    return updated
  }

  static async updateMany(data: Partial<Record<SettingKey, any>>): Promise<void> {
    const updateList = Object.entries(data).map(([k, v]) => ({ key: k, value: { value: v } }))
    for (const u of updateList) {
      if (SYSTEM_SETTINGS[u.key as SettingKey]) {
        await SettingService.update(u.key as SettingKey, u.value)
      }
    }
  }
}
