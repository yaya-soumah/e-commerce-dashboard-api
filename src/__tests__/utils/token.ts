import { signAccessToken, signRefreshToken } from '../../utils/jwt.util'

const token = (user: any) => {
  const permissions = [
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
  ]
  return {
    accessToken: signAccessToken({ userId: user.id, permissions, role: 'admin' }),
    refreshToken: signRefreshToken({ userId: user.id, permissions, role: 'admin' }),
  }
}

export default token
