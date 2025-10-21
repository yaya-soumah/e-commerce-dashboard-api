import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
const unlinkAsync = promisify(fs.unlink)

interface StorageOptions {
  maxSize: number
  allowedTypes: string[]
  uploadDir: string
}

export interface UploadResult {
  filename: string
  path: string
  url: string
}

export abstract class StorageService {
  abstract upload(
    files: Express.Multer.File[],
    metadata: Partial<MediaMetadata>,
  ): Promise<MediaMetadata[]>
  abstract delete(id: string): Promise<void>
  abstract getUrl(id: string): string
  abstract getPublicPath(filename: string): string
}

export class LocalStorageService extends StorageService {
  private uploader: multer.Multer

  constructor(options: StorageOptions) {
    super()
    const uploadDir = options.uploadDir
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    this.uploader = multer({
      storage: multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname)
          cb(null, `${uuidv4()}${ext}`)
        },
      }),
      limits: { fileSize: options.maxSize },
      fileFilter: (req, file, cb) => {
        if (options.allowedTypes.includes(file.mimetype)) cb(null, true)
        else cb(new Error(`Invalid file type: ${file.mimetype}`), false)
      },
    })
  }

  async upload(
    files: Express.Multer.File[],
    options?: { maxCount?: number },
  ): Promise<UploadResult[]> {
    return new Promise((resolve, reject) => {
      const multerFn = options?.maxCount
        ? this.uploader.array('files', options.maxCount)
        : this.uploader.single('file')
      multerFn(
        { files },
        null as any,
        (err, uploadedFiles: Express.Multer.File[] | Express.Multer.File) => {
          if (err) return reject(err)
          const results = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]
          const baseUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads`
          resolve(
            results.map((file) => ({
              filename: file.filename,
              path: file.path,
              url: `${baseUrl}/${file.filename}`,
            })),
          )
        },
      )
    })
  }

  async delete(id: string): Promise<void> {
    // In prod, map id to filename/path
    const filename = id // For local, use id as filename (adjust if needed)
    const filePath = path.join(process.env.UPLOAD_DIR!, filename)
    if (fs.existsSync(filePath)) await unlinkAsync(filePath)
  }

  getUrl(id: string): string {
    return `${process.env.APP_URL || 'http://localhost:3000'}/uploads/${id}`
  }

  getPublicPath(filename: string): string {
    return path.join(process.env.UPLOAD_DIR!, filename)
  }
}

// Prod stub (extend for S3)
export class S3StorageService extends StorageService {
  async upload(...args: any[]): Promise<MediaMetadata[]> {
    throw new Error('S3 not implemented')
  }
  async delete(...args: any[]): Promise<void> {
    throw new Error('S3 not implemented')
  }
  getUrl(id: string): string {
    return `https://bucket.s3.amazonaws.com/${id}`
  }
  getPublicPath(...args: any[]): string {
    throw new Error('Not applicable')
  }
}

// Factory
export const createStorageService = (): StorageService => {
  const provider = process.env.STORAGE_PROVIDER || 'local'
  const options: StorageOptions = {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE!) || 2097152,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  }
  return provider === 's3' ? new S3StorageService() : new LocalStorageService(options)
}
