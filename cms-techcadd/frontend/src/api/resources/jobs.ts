import type { BaseEntity, Job } from '../../types'
import { createHttpResource } from '../http/resource'

/** Read-only fields the API resolves for display; never sent back. */
type JobReadOnly = keyof BaseEntity | 'applications' | 'publishedAt'

export type JobCreate = Omit<Job, JobReadOnly | 'publishAt'> & {
  /** null clears the schedule. */
  publishAt?: string | null
}
export type JobUpdate = Partial<JobCreate>

/** Live against the Express API. */
export const jobsApi = createHttpResource<Job, JobCreate, JobUpdate>('/jobs')
