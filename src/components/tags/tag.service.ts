import { AppError } from '../../utils/app-error.util'
import { parseQuery } from '../../utils/pagination'

import { TagRepository } from './tag.repository'

export class TagService {
  static async getAllTags(query: any) {
    const {
      page,
      offset,
      limit,
      search: { name },
    } = await parseQuery(query)
    const { rows, count } = await TagRepository.findAll({ offset, limit, name })
    return {
      tags: rows,
      page,
      limit,
      total: count,
      totalPage: Math.ceil(limit / count),
    }
  }

  static async getTag(id: number) {
    return await this.checkTag(id)
  }

  static async createTag(name: string) {
    'check uniqueness of a tag'
    const existingTag = await TagRepository.findByName(name)
    if (existingTag) throw new AppError('name already exists')
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
