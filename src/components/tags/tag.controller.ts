import { Request, Response, NextFunction } from 'express'

import { success } from '../../utils/response.util'

import { TagService } from './tag.service'

export class TagController {
  static async listHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await TagService.getAllTags()
      success(res, 200, tags)
    } catch (err) {
      next(err)
    }
  }

  static async retrieveTagHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      const tag = await TagService.getTag(Number(id))
      success(res, 200, tag)
    } catch (err) {
      next(err)
    }
  }

  static async createTagHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const name = req.body.name
      const tag = await TagService.createTag(name)
      success(res, 201, tag, 'Tag created successfully')
    } catch (err) {
      next(err)
    }
  }
  static async updateTagHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const name = req.body.name
      const id = req.params.id
      const tag = await TagService.updateTag(Number(id), name)
      success(res, 200, tag, 'Tag updated successfully')
    } catch (err) {
      next(err)
    }
  }

  static async deleteTagHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      await TagService.deleteTag(Number(id))
      success(res, 200, {}, 'Tag deleted successfully')
    } catch (err) {
      next(err)
    }
  }
}
