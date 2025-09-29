import { Role, User } from '../../models'
import { parse } from '../../utils/bcrypt.util'
import { signAccessToken, signRefreshToken } from '../../utils/jwt.util'

/**
 * Creates a role and a user based on the given username
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

export async function generateTokens(username: string) {
  const { user, role } = await createUser(username)
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
