import { signAccessToken, signRefreshToken } from '../../utils/jwt.util'

const token = (user: any) => ({
  accessToken: signAccessToken({ userId: user.id, email: user.email, roleId: 'admin' }),
  refreshToken: signRefreshToken({ userId: user.id, email: user.email, roleId: 'admin' }),
})

export default token
