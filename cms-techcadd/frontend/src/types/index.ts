import type { LucideIcon } from 'lucide-react'

export * from './entities'

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

export type BadgeTone = 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'neutral'

export type TrendDirection = 'up' | 'down' | 'flat'

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

export interface NavItem {
  /** Stable key, also used as the module name on placeholder pages. */
  id: string
  label: string
  path: string
  icon: LucideIcon
  /** Optional count rendered as a pill on the right of the nav row. */
  badge?: number
}

export interface NavSection {
  id: string
  /** Section caption; hidden when the sidebar is collapsed. */
  title: string
  items: NavItem[]
}

/* ------------------------------------------------------------------ */
/* Dashboard statistics                                                 */
/* ------------------------------------------------------------------ */

export interface Stat {
  id: string
  label: string
  /** Absent when the API did not report this count — rendered as a dash. */
  value?: number
  icon: LucideIcon
  /** Percentage change vs. the comparison period — absent until history exists. */
  change?: number
  trend?: TrendDirection
  /** e.g. "vs. last month" — absent until history exists. */
  comparison?: string
  /** Route the card links to. */
  path: string
}

/* ------------------------------------------------------------------ */
/* Trend series                                                         */
/* ------------------------------------------------------------------ */

export interface TrendPoint {
  /** Short axis label, e.g. "Mon". */
  label: string
  /** Full label used in tooltips and the accessible data table. */
  fullLabel: string
  value: number
}

/* ------------------------------------------------------------------ */
/* Today's snapshot                                                     */
/* ------------------------------------------------------------------ */

export interface SnapshotItem {
  id: string
  label: string
  value: string
  icon: LucideIcon
}

/* ------------------------------------------------------------------ */
/* Quick actions                                                        */
/* ------------------------------------------------------------------ */

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: LucideIcon
  path: string
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                            */
/* ------------------------------------------------------------------ */

/** Zaavi's inquiry pipeline. Opening a new enquiry marks it read. */
export type EnquiryStatus = 'new' | 'read' | 'in_progress' | 'resolved' | 'archived'

/* ------------------------------------------------------------------ */
/* Applications                                                         */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected'
  | 'archived'

/* ------------------------------------------------------------------ */
/* Content status                                                       */
/* ------------------------------------------------------------------ */

/**
 * The publishing lifecycle of the website's content types — blogs, case
 * studies, portfolio and jobs. `scheduled` goes live by
 * itself at `publishAt`; `archived` is off the site but kept.
 */
export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived'

/**
 * The older three-state workflow FAQs still use — they
 * have no schedule, and "in review" is a hand-off between people.
 */
export type ReviewStatus = 'published' | 'draft' | 'review'

/* ------------------------------------------------------------------ */
/* Website overview                                                     */
/* ------------------------------------------------------------------ */

export interface ContentOverviewItem {
  id: string
  label: string
  value: number
  total: number
  tone: BadgeTone
}

export interface WebsiteStatus {
  label: string
  state: 'online' | 'degraded' | 'offline'
  detail: string
  /** Only shown once uptime is actually being measured. */
  uptime?: string
}

/* ------------------------------------------------------------------ */
/* Admin user                                                           */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  name: string
  role: string
  email: string
  initials: string
}
