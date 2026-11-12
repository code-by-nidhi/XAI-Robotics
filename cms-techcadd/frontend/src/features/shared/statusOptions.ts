import type { ContentStatus, ReviewStatus } from '../../types'

/**
 * The publishing states of the website's content types, in workflow order.
 *
 * Shared rather than declared per module so a status added to the API's
 * CONTENT_STATUSES shows up in every select at once. `scheduled` needs a
 * publish time — see PublishingFields.
 */
export const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'archived', label: 'Archived' },
]

/** FAQs keep the older review workflow. */
export const REVIEW_STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
]

/** List-page tabs for the content types. */
export const STATUS_TABS = [
  { value: '', label: 'All' },
  ...STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]
