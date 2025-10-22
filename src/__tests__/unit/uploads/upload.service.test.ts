import { UploadService } from '../../../components/uploads/upload.service'
import { fileService } from '../../../components/uploads/storage-service'
import { UploadRepository } from '../../../components/uploads/upload.repository'
import sequelize from '../../../config/database.config'
import { Product } from '../../../models'

// Mock dependencies
jest.mock('../../../components/uploads/storage-service', () => ({
  fileService: {
    save: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../../components/uploads/upload.repository')
jest.mock('../../../config/database.config', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
  },
}))

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  LOCK: { UPDATE: 'UPDATE' },
}

describe('UploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadProductImages', () => {
    it('should upload multiple product images successfully', async () => {
      const mockFiles: any[] = [
        { filename: '1.jpg', originalname: '1.jpg', mimetype: 'image/jpeg', size: 1000 },
        { filename: '2.jpg', originalname: '2.jpg', mimetype: 'image/jpeg', size: 2000 },
      ]

      const productId = 10

      // Mock product existence
      Product.findByPk = jest.fn().mockResolvedValue({ id: productId })

      // Mock current image count
      ;(UploadRepository.countProductImageForProduct as jest.Mock).mockResolvedValue(1)

      // Mock fileService.save
      ;(fileService.save as jest.Mock).mockImplementation((file) => ({
        filename: file.filename,
        url: `http://mock/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
      }))

      // Mock ProductImageRepository.create
      ;(UploadRepository.createProductImage as jest.Mock).mockImplementation((data) =>
        Promise.resolve(data),
      )

      const result = await UploadService.uploadProductImages(productId, mockFiles)

      expect(result.length).toBe(2)
      expect(UploadRepository.createProductImage).toHaveBeenCalledTimes(2)
      expect(fileService.save).toHaveBeenCalledTimes(2)
    })

    it('should throw if product not found', async () => {
      Product.findByPk = jest.fn().mockResolvedValue(null)

      await expect(UploadService.uploadProductImages(999, [])).rejects.toThrow('product not found')
    })

    it('should throw if exceeds max limit', async () => {
      Product.findByPk = jest.fn().mockResolvedValue({ id: 1 })
      ;(UploadRepository.countProductImageForProduct as jest.Mock).mockResolvedValue(5)

      await expect(
        UploadService.uploadProductImages(1, [{ filename: 'x.jpg' } as any]),
      ).rejects.toThrow('max image limit exceeded')
    })
  })

  describe('uploadUserAvatar', () => {
    beforeEach(() => {
      ;(sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction)
    })

    it('should upload user avatar successfully', async () => {
      const mockUser = { id: 1, avatarFilename: 'old.jpg', save: jest.fn() }
      ;(UploadRepository.findUserByIdForUpdate as jest.Mock).mockResolvedValue(mockUser)
      ;(fileService.save as jest.Mock).mockResolvedValue({
        filename: 'new.jpg',
        url: 'http://mock/new.jpg',
      })
      ;(UploadRepository.updateUserAvatar as jest.Mock).mockResolvedValue(mockUser)

      const result = await UploadService.uploadUserAvatar(1, { filename: 'new.jpg' } as any)

      expect(result.avatarUrl).toBe('http://mock/new.jpg')
      expect(mockTransaction.commit).toHaveBeenCalled()
      expect(fileService.delete).toHaveBeenCalledWith('old.jpg')
    })

    it('should rollback transaction if user not found', async () => {
      ;(UploadRepository.findUserByIdForUpdate as jest.Mock).mockResolvedValue(null)

      await expect(UploadService.uploadUserAvatar(1, { filename: 'f.jpg' } as any)).rejects.toThrow(
        'user not found',
      )

      expect(mockTransaction.rollback).toHaveBeenCalled()
    })
  })

  describe('deleteProductImage', () => {
    it('should delete existing image', async () => {
      const mockImage = { filename: 'toDelete.jpg', destroy: jest.fn() }
      ;(UploadRepository.findProductImageById as jest.Mock).mockResolvedValue(mockImage)

      await UploadService.deleteProductImage(1)

      expect(mockImage.destroy).toHaveBeenCalled()
      expect(fileService.delete).toHaveBeenCalledWith('toDelete.jpg')
    })

    it('should throw FILE_NOT_FOUND if image not exists', async () => {
      ;(UploadRepository.findProductImageById as jest.Mock).mockResolvedValue(null)

      await expect(UploadService.deleteProductImage(1)).rejects.toThrow('file not found')
    })
  })
})
