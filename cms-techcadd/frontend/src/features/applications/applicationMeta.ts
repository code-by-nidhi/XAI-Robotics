import { applicationStatusMeta } from '../../components/common/statusMeta'
import type { ApplicationStatus } from '../../types'

/** The hiring pipeline, in the order an application moves through it. */
export const PIPELINE: ApplicationStatus[] = [
  'new',
  'reviewing',
  'shortlisted',
  'interview',
  'offered',
  'hired',
]

/** The two ways an application leaves the pipeline without a hire. */
export const OUTCOMES: ApplicationStatus[] = ['rejected', 'archived']

export const APPLICATION_STATUS_OPTIONS = [...PIPELINE, ...OUTCOMES].map((status) => ({
  value: status,
  label: applicationStatusMeta[status].label,
}))

export function applicationStatusLabel(status: ApplicationStatus): string {
  return applicationStatusMeta[status]?.label ?? status
}
