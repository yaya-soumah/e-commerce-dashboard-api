import { Permission } from '../../models/index'

export class PermissionsRepository {
  static async findAll() {
    return await Permission.findAll()
  }

  static async findById(id: number) {
    return await Permission.findByPk(id)
  }

  static async findByKey(key: string) {
    return await Permission.findOne({ where: { key } })
  }

  static async create(data: { key: string; description: string }) {
    return await Permission.create(data)
  }
}
