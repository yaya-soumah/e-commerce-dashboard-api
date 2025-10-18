import jwt from 'jsonwebtoken'

import { PayloadType } from '../types'

import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from './env.util'

export function signAccessToken({ userId, role, permissions }: PayloadType) {
  return jwt.sign({ userId, role, permissions }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })
}

export function signRefreshToken({ userId, role, permissions }: PayloadType) {
  return jwt.sign({ userId, role, permissions }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET)
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET)
}
