import { config } from 'dotenv'
import type { StringValue } from 'ms'

import { AppError } from './app-error.util'
config()

function getEnvironmentVariable(name: string): StringValue {
  let value = process.env[name]
  if (!value) throw new AppError(`Missing env variable: ${name}`)
  return value as StringValue
}

export const ACCESS_TOKEN_SECRET = getEnvironmentVariable('ACCESS_TOKEN_SECRET')
export const REFRESH_TOKEN_SECRET = getEnvironmentVariable('REFRESH_TOKEN_SECRET')
export const ACCESS_TOKEN_EXPIRES_IN = getEnvironmentVariable('ACCESS_TOKEN_EXPIRES_IN')
export const REFRESH_TOKEN_EXPIRES_IN = getEnvironmentVariable('REFRESH_TOKEN_EXPIRES_IN')
