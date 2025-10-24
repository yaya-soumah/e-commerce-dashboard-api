import { Optional } from 'sequelize'

export const JobStatusValues = ['waiting', 'active', 'completed', 'failed', 'delayed'] as const

export type JobStatusType = (typeof JobStatusValues)[number]

export interface JobType {
  id: number
  jobName: string
  queueName: string
  data?: Record<string, any>
  status: string
  attempts: number
  result?: Record<string, any>
  error?: string
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type JobCreateType = Optional<JobType, 'id' | 'createdAt' | 'updatedAt'>
