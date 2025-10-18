import { Permission, Role, User } from '../../models'
import { PayloadType } from '../../types'
import { parse } from '../../utils/bcrypt.util'
import { signAccessToken, signRefreshToken } from '../../utils/jwt.util'

interface TokenObject {
  token: string
  refresh: string
  session: string
  user: User | null
  role: Role | null
}

/**
 * Creates a role and a user based on the given role name
 * @param username: the name of the user
 * @returns {role, user}
 */
export async function createUser(roleName: string) {
  const defaultRoles = {
    admin: [
      'user:view',
      'user:create',
      'user:update',
      'user:delete',
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'inventory:view',
      'inventory:create',
      'inventory:update',
      'inventory:delete',
      'category:view',
      'category:create',
      'category:update',
      'category:delete',
      'tag:view',
      'tag:create',
      'tag:update',
      'tag:delete',
      'order:create',
      'order:update',
      'order:view',
      'order:delete',
      'payment:create',
      'payment:update',
      'payment:view',
      'payment:delete',
      'analytic:view',
      'analytic:update',
      'analytic:delete',
      'dashboard:view',
    ],
    staff: [
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'inventory:view',
      'inventory:update',
      'category:update',
      'tag:update',
      'order:create',
      'order:update',
      'order:view',
      'payment:update',
      'payment:view',
    ],
    analyst: [
      'product:view',
      'inventory:view',
      'category:view',
      'tag:view',
      'order:view',
      'payment:view',
      'analytic:view',
      'dashboard:view',
    ],
  }

  const [role] = await Role.findOrCreate({ where: { name: roleName } })
  const permissions: string[] = defaultRoles[roleName as keyof typeof defaultRoles]
  const rolePermissions: Permission[] = []

  for (const key of permissions) {
    const [newPermission] = await Permission.findOrCreate({
      where: { key },
      defaults: {
        key,
        description: key,
      },
    })
    if (newPermission) {
      rolePermissions.push(newPermission)
    }
  }

  //add permissions to role
  await role.$set('permissions', rolePermissions)
  await role.save()

  const [user] = await User.findOrCreate({
    where: {
      name: roleName,
    },
    defaults: {
      name: roleName,
      email: `${roleName}@example.com`,
      roleId: role.id,
      password: await parse('Password123'),
    },
  })
  const returnUser = await User.findByPk(user.id, {
    include: [
      {
        model: Role,
        as: 'role',
        include: [
          {
            model: Permission,
            as: 'permissions',
          },
        ],
      },
    ],
  })
  return returnUser
}

/**
 * Takes role's name create user and role of same name alongside with token, refresh token and session cookie
 * @param roleName role's name used to create user of same name
 * @returns {token, refresh, session,  user, role}
 */
export async function generateTokens(roleName: string): Promise<TokenObject> {
  const user = await createUser(roleName)

  const payload: PayloadType = {
    userId: user?.id,
    role: user!.role!.name,
    permissions: user!.role!.permissions!.map((p: Permission) => p.key),
  }

  const token = signAccessToken(payload)
  const refresh = signRefreshToken(payload)
  const session = `refreshToken=${refresh}; HttpOnly; Secure=false; SameSite=strict`
  return { token, refresh, session, user, role: user!.role! }
}
