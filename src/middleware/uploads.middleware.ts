import path from 'path'

import multer from 'multer'
import { Express, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs-extra'

import { AppError } from '../utils/app-error.util'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
fs.ensureDirSync(UPLOAD_DIR)

// allowed mime types
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// file filter
function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new AppError('invalid file type', 400))
  }
  cb(null, true)
}

// storage for dev
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)

    const base = uuidv4()
    cb(null, `${base}${ext}`)
  },
})

// helpers
export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar')

export const productImagesUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
}).array('images', 5) // 5 images per upload

export const uploadDir = UPLOAD_DIR
export const allowedMimes = ALLOWED_MIMES
