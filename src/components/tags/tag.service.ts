import { AppError } from '../../utils/app-error.util'

import { TagRepository } from './tag.repository'

export class TagService {
  static async getAllTags() {
    return TagRepository.findAll()
  }

  static async getTag(id: number) {
    return await this.checkTag(id)
  }

  static async createTag(name: string) {
    return TagRepository.create(name)
  }

  static async updateTag(id: number, name: string) {
    const tag = await this.checkTag(id)
    await tag.update({ name })
    return tag
  }
  static async deleteTag(id: number) {
    const tag = await this.checkTag(id)
    await tag.destroy()
  }
  private static async checkTag(id: number) {
    const tag = await TagRepository.findById(id)
    if (!tag) throw new AppError('Tag not found', 404)
    return tag
  }
}
