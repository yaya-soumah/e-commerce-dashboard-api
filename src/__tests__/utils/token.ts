import { signAccessToken, signRefreshToken } from '../../utils/jwt.util'

const token = (user: any) => ({
  accessToken: signAccessToken({ userId: user.id, email: user.email, roleName: 'admin' }),
  refreshToken: signRefreshToken({ userId: user.id, email: user.email, roleName: 'admin' }),
})

export default token
