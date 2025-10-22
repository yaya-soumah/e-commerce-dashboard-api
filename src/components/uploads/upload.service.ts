import { Express } from 'express'

import sequelize from '../../config/database.config'
import { Product } from '../../models'
import { MAX_IMAGES_PER_PRODUCT } from '../../utils/env.util'
import { AppError } from '../../utils/app-error.util'
import logger from '../../config/logger'

import { fileService } from './storage-service'
import { UploadRepository } from './upload.repository'

export class UploadService {
  static async uploadProductImages(productId: number, files: Express.Multer.File[]) {
    const product = await Product.findByPk(productId)
    if (!product) throw new AppError('product not found', 404)

    const currentCount = await UploadRepository.countProductImageForProduct(productId)
    if (currentCount + files.length > Number(MAX_IMAGES_PER_PRODUCT))
      throw new AppError('max image limit exceeded', 400)

    const results: any[] = []

    for (const file of files) {
      const meta = await fileService.save(file)
      const record = await UploadRepository.createProductImage({
        productId,
        url: meta.url,
        filename: meta.filename,
        path: meta.path,
      })
      results.push(record)
    }

    return results
  }

  static async uploadUserAvatar(userId: number, file: Express.Multer.File) {
    const t = await sequelize.transaction()
    try {
      const user = await UploadRepository.findUserByIdForUpdate(userId, t)
      if (!user) throw new AppError('user not found', 404)

      const meta = await fileService.save(file)
      const oldFilename = user.avatarFilename

      await UploadRepository.updateUserAvatar(user, meta.url, meta.filename, t)
      await t.commit()

      // delete old after commit
      if (oldFilename) await fileService.delete(oldFilename).catch(logger.warn)

      return { avatarUrl: meta.url }
    } catch (err) {
      await t.rollback()
      if (file.filename) await fileService.delete(file.filename).catch(logger.warn)
      throw err
    }
  }

  static async deleteProductImage(id: number) {
    const image = await UploadRepository.findProductImageById(id)
    if (!image) throw new AppError('file not found', 404)
    await image.destroy()
    await fileService.delete(image.filename)
  }
}
