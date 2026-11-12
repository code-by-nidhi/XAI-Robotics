import { applicationsApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const applicationHooks = createResourceHooks('applications', applicationsApi)
