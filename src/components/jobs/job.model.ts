import { Table, Column, Model, DataType } from 'sequelize-typescript'

import type { JobCreateType, JobType, JobStatusType } from './job.type'
import { JobStatusValues } from './job.type'

@Table({ tableName: 'ecormmerce_jobLogs', timestamps: true })
export class JobLog extends Model<JobType, JobCreateType> {
  @Column({ type: DataType.STRING(100), allowNull: false, unique: 'unique_jobName_status' })
  declare jobName: string

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare queueName: string

  @Column({ type: DataType.JSONB })
  declare data?: Record<string, any>

  @Column({
    type: DataType.ENUM(...JobStatusValues),
    defaultValue: 'waiting',
    unique: 'unique_jobName_status',
  })
  declare status: JobStatusType

  @Column({ defaultValue: 0, allowNull: true })
  declare attempts: number

  @Column({ type: DataType.JSONB })
  declare result?: Record<string, any>

  @Column({ type: DataType.TEXT })
  declare error?: string

  @Column({ type: DataType.DATE })
  declare processedAt?: Date
}
