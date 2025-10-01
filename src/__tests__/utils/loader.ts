import { Role, User } from '../../models'
import { parse } from '../../utils/bcrypt.util'
import { signAccessToken, signRefreshToken } from '../../utils/jwt.util'

interface TokenObject {
  token: string
  refresh: string
  session: string
  user: User
  role: Role
}

/**
 * Creates a role and a user based on the given role name
 * @param username: the name of the user
 * @returns {role, user}
 */
export async function createUser(username: string) {
  const [role] = await Role.findOrCreate({ where: { name: username } })
  const [user] = await User.findOrCreate({
    where: {
      name: username,
    },
    defaults: {
      name: username,
      email: `${username}@example.com`,
      roleId: role.id,
      password: await parse('Password123'),
    },
  })
  return { user, role }
}

/**
 * Takes role's name create user and role of same name alongside with token, refresh token and session cookie
 * @param roleName role's name used to create user of same name
 * @returns {token, refresh, session,  user, role}
 */
export async function generateTokens(roleName: string): Promise<TokenObject> {
  const { user, role } = await createUser(roleName)
  const payload = {
    userId: user.id,
    email: user.email,
    roleName: role.name,
  }
  const token = signAccessToken(payload)
  const refresh = signRefreshToken(payload)
  const session = `refreshToken=${refresh}; HttpOnly; Secure=false; SameSite=strict`
  return { token, refresh, session, user, role }
}
