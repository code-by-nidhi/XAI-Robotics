/**
 * The swap point.
 *
 * Every resource below is backed by the Express API through `./http/resource`,
 * which builds the five `Resource<T>` methods from a base path. Nothing outside
 * this directory knows where the data comes from — the contract in `./types` is
 * what the features are written against, which is why the cut over from the
 * old localStorage mock touched only these files.
 */
export { activityApi } from './resources/activity'
export { blogsApi } from './resources/blogs'
export { caseStudiesApi } from './resources/caseStudies'
export { portfolioApi } from './resources/portfolio'
export { jobsApi } from './resources/jobs'
export { applicationsApi, downloadApplicationCv } from './resources/applications'
export { enquiriesApi } from './resources/enquiries'
export { enquiriesLockApi } from './resources/enquiriesLock'
export { mediaApi } from './resources/media'
export { redirectsApi } from './resources/redirects'
export { faqCategoriesApi } from './resources/faqCategories'
export { faqsApi } from './resources/faqs'
export { testimonialsApi } from './resources/testimonials'
export { usersApi } from './resources/users'
export { settingsApi } from './resources/settings'

export { ApiError, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from './types'
export type { ListParams, ListResult, Resource, SortDirection } from './types'
