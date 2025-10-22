import { config } from 'dotenv'
// import type { StringValue } from 'ms'

import { AppError } from './app-error.util'
config()

function getEnvironmentVariable(name: string): string {
  let value = process.env[name]
  if (!value) throw new AppError(`Missing env variable: ${name}`)
  return value
}

export const NODE_ENV = getEnvironmentVariable('NODE_ENV')
export const ACCESS_TOKEN_SECRET = getEnvironmentVariable('ACCESS_TOKEN_SECRET')
export const REFRESH_TOKEN_SECRET = getEnvironmentVariable('REFRESH_TOKEN_SECRET')
export const ACCESS_TOKEN_EXPIRES_IN = getEnvironmentVariable('ACCESS_TOKEN_EXPIRES_IN')
export const REFRESH_TOKEN_EXPIRES_IN = getEnvironmentVariable('REFRESH_TOKEN_EXPIRES_IN')
export const UPLOAD_DIR = getEnvironmentVariable('UPLOAD_DIR')
export const APP_URL = getEnvironmentVariable('APP_URL')
export const AWS_ACCESS_KEY_ID = getEnvironmentVariable('AWS_ACCESS_KEY_ID')
export const AWS_SECRET_ACCESS_KEY = getEnvironmentVariable('AWS_SECRET_ACCESS_KEY')
export const AWS_S3_BUCKET = getEnvironmentVariable('AWS_S3_BUCKET')
export const AWS_REGION = getEnvironmentVariable('AWS_REGION')
export const MAX_IMAGES_PER_PRODUCT = getEnvironmentVariable('MAX_IMAGES_PER_PRODUCT')
