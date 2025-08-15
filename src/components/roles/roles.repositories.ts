import { Permission, Role } from '../../models/index'

export class RolesRepository {
  static async create(roleData: { name: string }) {
    return Role.create(roleData)
  }

  static async getByName(name: string) {
    return Role.findOne({ where: { name } })
  }

  static async getOrCreate(name: string) {
    const [role] = await Role.findOrCreate({ where: { name } })
    return role
  }

  static async getById(id: number) {
    return Role.findByPk(id)
  }
  static async getAll() {
    return Role.findAll({
      include: {
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'key', 'description'],
        through: { attributes: [] }, // Exclude the junction table attributes
      },
    })
  }
}
