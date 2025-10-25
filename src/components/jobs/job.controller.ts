import { Request, Response, NextFunction } from 'express'

import { JobService } from './job.service'
import { JobParamsSchema } from './job.schema'

export class JobController {
  static async triggerJob(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req as any).user.role // Assume user has role
      const { jobName } = JobParamsSchema.parse(req.params.jobName)
      const result = await JobService.triggerJob(jobName, req.body.data || {}, role)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async getJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobName } = JobParamsSchema.parse(req.params.jobName)
      const result = await JobService.getJobStatus(jobName)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async getScheduled(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await JobService.getScheduledJobs()
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
