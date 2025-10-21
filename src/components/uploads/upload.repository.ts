import { Transaction } from 'sequelize'

import { ProductImage, User } from '../../models'

import { UploadProductImageType } from './upload.types'

export class UploadRepository {
  static async createProductImage(
    data: UploadProductImageType,
    transaction?: Transaction,
  ): Promise<ProductImage> {
    return ProductImage.create(data, { transaction })
  }

  static async countProductImages(productId: number): Promise<number> {
    return ProductImage.count({ where: { productId } }) // Assume paranoid
  }

  static async updateUserAvatar(
    userId: number,
    avatar: string,
    avatarFilename: string,
    transaction?: Transaction,
  ): Promise<User | null> {
    const user = await User.findByPk(userId)
    if (!user) return null
    user.update({ avatar, avatarFilename }, { transaction, returning: true })
    user.save()
    return user
  }

  static async getUserAvatarFilename(userId: number): Promise<string | null> {
    const user = await User.findByPk(userId, { attributes: ['avatarFilename'] })
    return user?.avatarFilename || null
  }

  static async deleteProductImage(imageId: number, transaction?: Transaction): Promise<boolean> {
    const image = await ProductImage.findByPk(imageId)
    if (!image) return false
    await image.destroy({ transaction })
    return true
  }
}
