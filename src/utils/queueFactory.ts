import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

import { JobLog } from '../models'
import { JobStatusType } from '../components/jobs/job.type'

const connection = new IORedis(process.env.REDIS_URL!, { lazyConnect: true })

export const QUEUES = {
  notifications: 'notifications',
  reporting: 'reporting',
  maintenance: 'maintenance',
} as const

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES]

export function createQueue(name: QueueName): Queue {
  return new Queue(name, { connection })
}

export function createWorker(name: QueueName, processor: (job: any) => Promise<any>): Worker {
  const worker = new Worker(name, processor, { connection })
  worker.on('completed', async (job) => {
    await logJobResult(job, 'completed')
  })
  worker.on('failed', async (job, err) => {
    await logJobResult(job, 'failed', err.message)
  })
  return worker
}

async function logJobResult(job: any, status: string, error?: string | undefined): Promise<void> {
  if (!job?.data?.jobLogId) return
  const log = await JobLog.findByPk(job.data.jobLogId)
  if (log) {
    log.status = status as JobStatusType
    log.processedAt = new Date()
    if (status === 'completed') log.result = job.returnvalue
    if (status === 'failed') log.error = error
    log.attempts = job.attemptsMade || 0
    await log.save()
  }
}
