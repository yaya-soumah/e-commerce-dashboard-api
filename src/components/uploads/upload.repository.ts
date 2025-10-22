import { Transaction } from 'sequelize'

import { ProductImage, User } from '../../models'

export class UploadRepository {
  static async createProductImage(
    data: Partial<ProductImage> & { url: string },
  ): Promise<ProductImage> {
    return ProductImage.create(data as any)
  }

  static async findProductImageById(id: number) {
    return ProductImage.findByPk(id)
  }

  static async deleteProductImage(id: number) {
    const image = await ProductImage.findByPk(id)
    if (!image) return null
    await image.destroy()
    return image
  }

  static async countProductImageForProduct(productId: number) {
    return ProductImage.count({ where: { productId } })
  }

  static async listProductImageForProduct(productId: number) {
    return ProductImage.findAll({ where: { productId } })
  }

  static async findUserByIdForUpdate(userId: number, t?: Transaction): Promise<User> {
    return User.findByPk(userId, { transaction: t, lock: t?.LOCK.UPDATE })
  }

  static async updateUserAvatar(
    user: User,
    avatarUrl: string,
    avatarFilename: string,
    t?: Transaction,
  ) {
    user.avatar = avatarUrl
    user.avatarFilename = avatarFilename
    await user.save({ transaction: t })
    return user
  }
}
