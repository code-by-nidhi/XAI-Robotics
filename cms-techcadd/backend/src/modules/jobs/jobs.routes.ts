import { contentRouter } from '../shared/router.js'
import * as repo from './jobs.repo.js'
import { jobPatchSchema, jobSchema } from './jobs.schema.js'

export const jobsRouter = contentRouter(repo, { create: jobSchema, patch: jobPatchSchema })
