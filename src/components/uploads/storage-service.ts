import { diskFileService } from './upload.service.disk'
import { s3FileService } from './upload.service.s3'

const isProd = process.env.NODE_ENV === 'production'

// choose backend dynamically
export const fileService = isProd ? s3FileService : diskFileService
