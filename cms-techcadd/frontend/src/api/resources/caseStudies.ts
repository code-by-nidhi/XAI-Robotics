import type { BaseEntity, CaseStudy } from '../../types'
import { createHttpResource } from '../http/resource'

/** Read-only fields the API resolves for display; never sent back. */
type CaseStudyReadOnly = keyof BaseEntity | 'views' | 'publishedAt'

export type CaseStudyCreate = Omit<CaseStudy, CaseStudyReadOnly | 'publishAt'> & {
  /** null clears the schedule. */
  publishAt?: string | null
}
export type CaseStudyUpdate = Partial<CaseStudyCreate>

/** Live against the Express API. */
export const caseStudiesApi = createHttpResource<CaseStudy, CaseStudyCreate, CaseStudyUpdate>('/case-studies')
