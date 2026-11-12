import type { BaseEntity, PortfolioItem } from '../../types'
import { createHttpResource } from '../http/resource'

/** Read-only fields the API resolves for display; never sent back. */
type PortfolioItemReadOnly = keyof BaseEntity | 'caseStudy' | 'publishedAt'

export type PortfolioItemCreate = Omit<PortfolioItem, PortfolioItemReadOnly | 'publishAt'> & {
  /** null clears the schedule. */
  publishAt?: string | null
}
export type PortfolioItemUpdate = Partial<PortfolioItemCreate>

/** Live against the Express API. */
export const portfolioApi = createHttpResource<PortfolioItem, PortfolioItemCreate, PortfolioItemUpdate>('/portfolio')
