import { request } from '../client'
import type { EnquiryRecord } from '../../types'

export interface DashboardTotals {
  blogs: number
  caseStudies: number
  portfolio: number
  jobs: number
  /** Jobs taking applications right now: live and not past their closing date. */
  openJobs: number
  applications: number
  enquiries: number
}

export interface DashboardTrendPoint {
  /** ISO date, oldest first. */
  date: string
  value: number
}

/** One recently edited record from any content table. */
export interface DashboardContent {
  id: string
  title: string
  /**
   * The module's URL segment: 'blogs', 'case-studies', 'portfolio' or 'jobs'.
   * Typed as a plain string rather than that union so a kind the dashboard
   * has no icon for yet is still listed instead of breaking the panel.
   */
  kind: string
  status: string
  updatedAt: string
}

/** One audit-log row — the same shape the activity log pages read. */
export interface DashboardActivity {
  id: string
  userName: string
  action: string
  entityType: string
  entityId: string | null
  entityLabel: string | null
  createdAt: string
}

export interface DashboardSummary {
  totals: DashboardTotals
  today: {
    newEnquiries: number
    newApplications: number
    /** Enquiries still in the `new` state, whenever they arrived. */
    unreadEnquiries: number
    unreviewedApplications: number
    /** Content queued to publish itself later. */
    scheduled: number
  }
  enquiryTrend: DashboardTrendPoint[]
  /** Status counts across the content tables (blogs, case studies, …). */
  contentOverview: { published: number; draft: number; scheduled: number; archived: number; total: number }
  recentContent: DashboardContent[]
  recentActivity: DashboardActivity[]
  /** The same shape /api/enquiries returns; empty while enquiries are locked. */
  recentEnquiries: EnquiryRecord[]
}

/** Everything the dashboard renders, in one request. */
export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard/summary')
}

export interface SearchHit {
  id: string
  label: string
  detail?: string
}

export interface SearchGroup {
  /**
   * 'blogs', 'case-studies', 'portfolio', 'jobs' or 'enquiries'. Open-ended:
   * the API grows a group with each searchable module.
   */
  key: string
  hits: SearchHit[]
}

/** Global search. Terms shorter than two characters come back empty. */
export function fetchSearch(term: string): Promise<{ groups: SearchGroup[] }> {
  return request<{ groups: SearchGroup[] }>('/search', { query: { q: term } })
}
