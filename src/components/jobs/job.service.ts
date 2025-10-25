import { AppError } from '../../utils/app-error.util'

import { JobRepository } from './job.repository'
import { notificationsQueue, reportingQueue, maintenanceQueue } from './job.queue.notifications'

const ALLOWED_JOBS = {
  admin: ['lowStockAlert', 'dailySalesReport', 'inventorySnapshot', 'orderCleanup', 'exportCSV'],
  analyst: ['exportCSV', 'dailySalesReport'],
  staff: [],
} as const

export class JobService {
  static async triggerJob(jobName: string, data: Record<string, any>, role: string): Promise<any> {
    if (!ALLOWED_JOBS[role as keyof typeof ALLOWED_JOBS].includes(jobName as never)) {
      throw new AppError('Unauthorized job', 403)
    }

    const existing = await JobRepository.getLogs({ jobName })
    if (existing.rows.length > 0 && existing.rows[0].status === 'completed') {
      return { jobLogId: existing.rows[0].id }
    }

    const queue = JobService.getQueue(jobName)
    const log = await JobRepository.createLog({
      jobName,
      queueName: queue.name,
      data: { ...data },
      status: 'waiting',
      attempts: 2,
    })

    const job = await queue.add(
      jobName,
      { ...data, jobLogId: log.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 10, // Keep 10 completed
        removeOnFail: 5, // Keep 5 failed
      },
    )

    return { jobId: job.id, jobLogId: log.id }
  }

  private static getQueue(jobName: string): any {
    // Map job to queue
    if (['lowStockAlert'].includes(jobName)) return notificationsQueue
    if (['dailySalesReport', 'exportCSV'].includes(jobName)) return reportingQueue
    if (['orderCleanup'].includes(jobName)) return maintenanceQueue
    throw new AppError('Invalid queue', 400)
  }

  static async getJobStatus(jobName: string): Promise<any> {
    const { rows } = await JobRepository.getLogs({ jobName })
    return {
      slogs: rows.map((l) => ({
        id: l.id,
        status: l.status,
        result: l.result,
        error: l.error,
        processedAt: l.processedAt,
      })),
    }
  }

  static async scheduleJob(jobName: string, cron: string): Promise<any> {
    // Admin only
    const queue = JobService.getQueue(jobName)
    const repeatable = await queue.add(jobName, {}, { repeat: { cron } })
    return { repeatableJobId: repeatable.id }
  }

  static async getScheduledJobs(): Promise<any> {
    // Aggregate from all queues
    const scheduled = []
    for (const q of Object.values({ notificationsQueue, reportingQueue })) {
      const repeats = await q.getJobSchedulers()
      scheduled.push(...repeats)
    }
    return { scheduled }
  }
}
