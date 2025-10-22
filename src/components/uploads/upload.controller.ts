import { Request, Response, NextFunction, Express } from 'express'

import { success } from '../../utils/response.util'

import { UploadService } from './upload.service'

export class UploadController {
  static async uploadProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.productId)
      const files = req.files as Express.Multer.File[]
      const result = await UploadService.uploadProductImages(productId, files)
      success(res, 201, result)
    } catch (err) {
      next(err)
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id
      const file = req.file as Express.Multer.File
      const result = await UploadService.uploadUserAvatar(userId, file)
      success(res, 200, result)
    } catch (err) {
      next(err)
    }
  }

  static async deleteUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await UploadService.deleteProductImage(id)
      success(res, 200, {}, 'Deleted')
    } catch (err) {
      next(err)
    }
  }
}
