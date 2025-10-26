import { WhereOptions, Transaction } from 'sequelize'

import { Setting } from '../../models'

import { SettingsAttributes } from './settings.type'
import { SYSTEM_SETTINGS } from './settings.schema'
import type { SettingKey } from './settings.schema'

export class SettingRepository {
  static async findAll(category?: string): Promise<Setting[]> {
    const where: WhereOptions<SettingsAttributes> = {}
    if (category) where.category = category
    return Setting.findAll({ where })
  }

  static async findByKey(key: SettingKey): Promise<Setting | null> {
    return Setting.findOne({ where: { key } })
  }

  static async upsert(key: SettingKey, value: { value: any }): Promise<Setting> {
    const setting = await Setting.findOne({ where: { key } })
    if (setting) {
      setting.value = value
      await setting.save()
      return setting
    } else {
      const meta = SYSTEM_SETTINGS[key]
      return Setting.create({
        key,
        value,
        type: meta.type,
        category: meta.category,
        description: meta.description,
      })
    }
  }

  static async bulkUpdate(
    updates: Array<{ key: string; value: { value: any } }>,
    transaction: Transaction,
  ): Promise<void> {
    try {
      await Promise.all(updates.map((u) => SettingRepository.upsert(u.key, u.value)))
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
