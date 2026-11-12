import { jobsApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

/** Keyed 'jobs' — the applications inbox reads the same list for its filter. */
export const jobHooks = createResourceHooks('jobs', jobsApi)
