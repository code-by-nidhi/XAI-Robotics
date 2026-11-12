import type { EnquiryStatus } from '../../types'

export const STATUS_OPTIONS: { value: EnquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
]

/**
 * The working pipeline, in order. Archiving takes an enquiry out of the inbox
 * without deleting it, so it sits outside the progression.
 */
export const PIPELINE: EnquiryStatus[] = ['new', 'read', 'in_progress', 'resolved']

/**
 * List tabs. "Inbox" sends no status, which the API reads as "everything but
 * archived"; "All" has to say so explicitly with status=all.
 */
export const STATUS_TABS = [
  { value: '', label: 'Inbox' },
  ...STATUS_OPTIONS,
  { value: 'all', label: 'All' },
]

export function statusLabel(status: string): string {
  if (status === 'all') return 'All'
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

/** Digits only — `wa.me` rejects spaces, plus signs and punctuation. */
export function whatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
