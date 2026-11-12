import type { BaseEntity, Blog } from '../../types'
import { createHttpResource } from '../http/resource'

/** Resolved by the API for display; never sent back. */
type BlogReadOnly = keyof BaseEntity | 'author' | 'readMinutes' | 'views' | 'publishedAt'

export type BlogCreate = Omit<Blog, BlogReadOnly | 'publishAt'> & {
  /** null clears the schedule. */
  publishAt?: string | null
}
export type BlogUpdate = Partial<BlogCreate>

/** Live against the Express API. */
export const blogsApi = createHttpResource<Blog, BlogCreate, BlogUpdate>('/blogs')
