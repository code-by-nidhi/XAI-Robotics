import type { ApplicationStatus, BadgeTone } from '../../types'

/**
 * Label and tone per application status, shared by the badge and the
 * applications module's selects. Its own module because a file exporting both
 * components and plain values breaks fast refresh.
 */
export const applicationStatusMeta: Record<ApplicationStatus, { label: string; tone: BadgeTone }> = {
  new: { label: 'New', tone: 'primary' },
  reviewing: { label: 'Reviewing', tone: 'neutral' },
  shortlisted: { label: 'Shortlisted', tone: 'info' },
  interview: { label: 'Interview', tone: 'warning' },
  offered: { label: 'Offered', tone: 'info' },
  hired: { label: 'Selected', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  archived: { label: 'Archived', tone: 'neutral' },
}
