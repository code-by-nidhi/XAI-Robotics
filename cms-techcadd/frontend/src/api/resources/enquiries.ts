import type { BaseEntity, EnquiryRecord, EnquiryStatus } from '../../types'
import { request } from '../client'
import { createHttpResource } from '../http/resource'

/** `assignee` is resolved by the API for display and never sent back. */
export type EnquiryCreate = Omit<EnquiryRecord, keyof BaseEntity | 'assignee'>
export type EnquiryUpdate = Partial<EnquiryCreate>

/** Live against the Express API. */
export const enquiriesApi = createHttpResource<
  EnquiryRecord,
  EnquiryCreate,
  EnquiryUpdate
>('/enquiries')

/**
 * Restatus or reassign a selection in one request.
 *
 * One call rather than a PATCH per row: a partial failure halfway through a
 * loop would leave the selection in two states with no way to tell which.
 * `assigneeId: ''` unassigns.
 */
export function bulkUpdateEnquiries(input: {
  ids: string[]
  status?: EnquiryStatus
  assigneeId?: string
}): Promise<{ updated: number }> {
  return request<{ updated: number }>('/enquiries/bulk', { method: 'PATCH', body: input })
}
