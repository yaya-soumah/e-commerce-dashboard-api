import path from 'path'

import fs from 'fs-extra'
import { Express } from 'express'

import logger from '../../config/logger'
import { uploadDir } from '../../middleware/uploads.middleware'
import { AppError } from '../../utils/app-error.util'

export interface StoredFile {
  filename: string
  originalname: string
  mimetype: string
  size: number
  path: string
  url: string
}

function toPublicUrl(filename: string) {
  const baseUrl = process.env.UPLOAD_BASE_URL || '/uploads'
  return `${baseUrl}/${filename}`
}

export const diskFileService = {
  async save(file: Express.Multer.File): Promise<StoredFile> {
    const filename = file.filename
    const filePath = path.join(uploadDir, filename)
    const url = toPublicUrl(filename)
    return {
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      url,
    }
  },

  async delete(filename: string): Promise<void> {
    try {
      const filePath = path.join(uploadDir, filename)
      await fs.remove(filePath)
    } catch (err) {
      logger.error('deleteDiskFile error', err)
      throw new AppError('error occurs when deleting image', 500)
    }
  },
}
