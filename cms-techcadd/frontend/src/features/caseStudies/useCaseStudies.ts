import { caseStudiesApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

/** Keyed 'case-studies' so the case study pickers on other forms refresh with it. */
export const caseStudyHooks = createResourceHooks('case-studies', caseStudiesApi)
