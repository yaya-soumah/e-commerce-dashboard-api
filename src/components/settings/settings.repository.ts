import { WhereOptions, Transaction } from 'sequelize'

import { Setting } from '../../models'

import { SettingsType } from './settings.type'

export class SettingRepository {
  static async getAll(category?: string): Promise<Setting[]> {
    const where: WhereOptions<SettingsType> = {}
    if (category) where.category = category
    return Setting.findAll({ where })
  }

  static async getByKey(key: string): Promise<Setting | null> {
    return Setting.findOne({ where: { key } })
  }

  static async update(key: string, value: { value: any }): Promise<Setting | null> {
    await Setting.update({ key, value }, { where: { key } })
    return Setting.findOne({ where: { key } })
  }

  static async bulkUpdate(
    updates: Array<{ key: string; value: { value: any } }>,
    transaction: Transaction,
  ): Promise<void> {
    try {
      await Promise.all(updates.map((u) => SettingRepository.update(u.key, u.value)))
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
