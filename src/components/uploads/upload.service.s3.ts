import path from 'path'
import { createReadStream } from 'fs'

import { Express } from 'express'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

import {
  AWS_S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
} from '../../utils/env.util'

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
})

const bucketName = AWS_S3_BUCKET

export const s3FileService = {
  async save(file: Express.Multer.File) {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    const key = `uploads/${filename}`

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer ?? createReadStream(file.path),
        ContentType: file.mimetype,
      }),
    )

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return {
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: key,
      url,
    }
  },

  async delete(filename: string): Promise<DeleteObjectCommandOutput> {
    const key = `uploads/${filename}`
    return s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    )
  },
}
