import { z } from 'zod'

import { ALLOWED_JOBS_VALUES } from './job.type'

export const JobParamsSchema = z.object({
  jobName: z.enum(ALLOWED_JOBS_VALUES),
})

export const JobBodySchema = z.object({
  data: z.object().optional(),
})
