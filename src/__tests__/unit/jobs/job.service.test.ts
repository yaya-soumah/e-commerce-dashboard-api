import { JobService } from '../../../components/jobs/job.service'
import { JobRepository } from '../../../components/jobs/job.repository'
import {
  notificationsQueue,
  reportingQueue,
} from '../../../components/jobs/job.queue.notifications'
import { AppError } from '../../../utils/app-error.util'

jest.mock('../../../components/jobs/job.repository')
jest.mock('../../../components/jobs/job.queue.notifications', () => ({
  notificationsQueue: { name: 'notifications', add: jest.fn(), getJobSchedulers: jest.fn() },
  reportingQueue: { name: 'reporting', add: jest.fn(), getJobSchedulers: jest.fn() },
  maintenanceQueue: { name: 'maintenance', add: jest.fn(), getJobSchedulers: jest.fn() },
}))

describe('JobService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('triggerJob()', () => {
    it('should throw Unauthorized if job not allowed for role', async () => {
      await expect(JobService.triggerJob('lowStockAlert', {}, 'analyst')).rejects.toThrow(AppError)
    })

    it('should return existing completed job if already completed', async () => {
      ;(JobRepository.getLogs as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, status: 'completed' }],
      })

      const result = await JobService.triggerJob('lowStockAlert', {}, 'admin')
      expect(result).toEqual({ jobLogId: 1 })
      expect(JobRepository.createLog).not.toHaveBeenCalled()
    })

    it('should create a new job log and add to queue', async () => {
      const mockJob = { id: 'job123' }
      const mockLog = { id: 10 }

      ;(JobRepository.getLogs as jest.Mock).mockResolvedValue({ rows: [] })
      ;(JobRepository.createLog as jest.Mock).mockResolvedValue(mockLog)
      ;(notificationsQueue.add as jest.Mock).mockResolvedValue(mockJob)

      const result = await JobService.triggerJob('lowStockAlert', { foo: 'bar' }, 'admin')

      expect(JobRepository.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          jobName: 'lowStockAlert',
          queueName: 'notifications',
          status: 'waiting',
        }),
      )

      expect(notificationsQueue.add).toHaveBeenCalledWith(
        'lowStockAlert',
        expect.objectContaining({ foo: 'bar', jobLogId: mockLog.id }),
        expect.objectContaining({
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        }),
      )

      expect(result).toEqual({ jobId: 'job123', jobLogId: 10 })
    })

    it('should throw Invalid queue error if unknown jobName', async () => {
      await expect(JobService.triggerJob('unknownJob', {}, 'admin')).rejects.toThrow(
        'Unauthorized job',
      )
    })
  })

  describe('getJobStatus()', () => {
    it('should map job logs correctly', async () => {
      ;(JobRepository.getLogs as jest.Mock).mockResolvedValue({
        rows: [
          { id: 1, status: 'completed', result: 'ok', error: null, processedAt: '2024-01-01' },
        ],
      })

      const result = await JobService.getJobStatus('lowStockAlert')
      expect(result).toEqual({
        slogs: [
          { id: 1, status: 'completed', result: 'ok', error: null, processedAt: '2024-01-01' },
        ],
      })
    })
  })

  describe('scheduleJob()', () => {
    it('should schedule a repeatable job', async () => {
      const mockRepeat = { id: 'repeat123' }
      ;(reportingQueue.add as jest.Mock).mockResolvedValue(mockRepeat)

      const result = await JobService.scheduleJob('dailySalesReport', '0 0 * * *')
      expect(result).toEqual({ repeatableJobId: 'repeat123' })
    })
  })

  describe('getScheduledJobs()', () => {
    it('should aggregate scheduled jobs from queues', async () => {
      ;(notificationsQueue.getJobSchedulers as jest.Mock).mockResolvedValue([{ id: 1 }])
      ;(reportingQueue.getJobSchedulers as jest.Mock).mockResolvedValue([{ id: 2 }])

      const result = await JobService.getScheduledJobs()
      expect(result.scheduled).toEqual([{ id: 1 }, { id: 2 }])
    })
  })
})
