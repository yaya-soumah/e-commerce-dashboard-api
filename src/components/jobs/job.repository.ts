import { WhereOptions } from 'sequelize'

import { JobLog } from '../../models'

import type { JobFilters, JobType, JobCreateType } from './job.type'

export class JobRepository {
  static async createLog(data: JobCreateType): Promise<JobLog> {
    return JobLog.create(data)
  }

  static async getLogs(filters: JobFilters): Promise<{ rows: JobLog[]; count: number }> {
    const { jobName, status, offset = 0, limit = 20 } = filters

    const where: WhereOptions<JobType> = {}
    if (jobName) where.jobName = jobName
    if (status) where.status = status

    return JobLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })
  }
}
