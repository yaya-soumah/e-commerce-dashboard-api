import { Role, Permission, User } from '../models'
import { parse } from '../utils/bcrypt.util'

const defaultPermissions = [
  { key: 'user:create', description: 'Create users' },
  { key: 'user:update', description: 'Update users' },
  { key: 'user:delete', description: 'Delete users' },
  { key: 'user:view', description: 'View users' },
  { key: 'product:create', description: 'Create products' },
  { key: 'product:update', description: 'Update products' },
  { key: 'product:delete', description: 'Delete products' },
  { key: 'product:view', description: 'view products' },
  { key: 'order:create', description: 'Create orders' },
  { key: 'order:update', description: 'Update orders' },
  { key: 'order:delete', description: 'Delete orders' },
  { key: 'order:view', description: 'view orders' },
  { key: 'dashboard:read', description: 'Read dashboard data' },
]

const defaultRoles = [
  {
    name: 'admin',
    permissions: [
      'user:create',
      'user:update',
      'user:delete',
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'order:create',
      'order:update',
      'order:view',
      'dashboard:read',
    ],
  },
  {
    name: 'staff',
    permissions: [
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'order:create',
      'order:update',
      'order:view',
    ],
  },
  {
    name: 'analyst',
    permissions: ['product:view', 'order:view', 'dashboard:read'],
  },
]

export const seedDatabase = async () => {
  const permissions: Permission[] = []
  try {
    for (const perm of defaultPermissions) {
      const [newPermission] = await Permission.findOrCreate({
        where: { key: perm.key },
        defaults: perm,
      })
      permissions.push(newPermission)
    }

    for (const roleData of defaultRoles) {
      const [role] = await Role.findOrCreate({
        where: { name: roleData.name },
      })
      roleData.permissions = roleData.permissions.map(
        (key) => permissions.find((perm) => perm.key === key)?.id,
      )
      if (roleData.permissions.length > 0) {
        role.$set('permissions', roleData.permissions)
        role.save()
      }
    }
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'admin' },
    })
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await parse('Password123'),
        roleId: adminRole.id,
      },
    })
  } catch (error) {
    console.error('Failed to seed database', error)
  }
}
