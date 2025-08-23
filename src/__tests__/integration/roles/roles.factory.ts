export const defaultPermissions = [
  { key: 'user:create', description: 'Create users' },
  { key: 'user:update', description: 'Update users' },
  { key: 'user:delete', description: 'Delete users' },
  { key: 'user:view', description: 'View users' },
]

export const defaultRoles = [
  {
    name: 'admin',
    permissions: ['user:create', 'user:update', 'user:delete'],
  },
  {
    name: 'staff',
    permissions: ['product:create', 'product:update', 'product:delete', 'product:view'],
  },
  {
    name: 'analyst',
    permissions: ['product:view', 'order:view', 'dashboard:read'],
  },
]
