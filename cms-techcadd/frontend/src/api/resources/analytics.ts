import { request } from '../client'

export type AnalyticsRange = 7 | 30 | 90

/** A figure and its change against the previous period of the same length. */
export interface ChangeStat {
  value: number
  /** Percent. Null when the previous period had nothing to compare against. */
  change: number | null
}

export interface AnalyticsOverview {
  days: number
  /** The first day any view was recorded, or null before tracking began. */
  trackingSince: string | null
  stats: {
    views: ChangeStat
    /** Distinct paths viewed in the range. */
    pages: number
    enquiries: ChangeStat
    published: ChangeStat & { blogs: number; caseStudies: number; portfolio: number }
  }
  /** One point per day in the range, oldest first, including empty days. */
  series: { date: string; views: number }[]
  topPages: { path: string; label: string; views: number }[]
  enquiriesByService: { service: string; count: number }[]
}

export type ContentPerformanceType = 'blog' | 'case_study'
export type ContentPerformanceSort = 'range' | 'total' | 'published' | 'title'

export interface ContentPerformanceRow {
  id: string
  title: string
  type: ContentPerformanceType
  status: string
  /** The site path, e.g. /blog/<slug>. */
  url: string
  readMinutes: number | null
  publishedAt: string | null
  totalViews: number
  rangeViews: number
}

export interface ContentPerformance {
  query: { range: number; type: ContentPerformanceType | null; sort: ContentPerformanceSort }
  rows: ContentPerformanceRow[]
  stats: {
    totalViews: number
    rangeViews: number
    published: number
    average: number
    top: { title: string; views: number } | null
  }
}

export function fetchAnalyticsOverview(range: AnalyticsRange): Promise<AnalyticsOverview> {
  return request<AnalyticsOverview>('/analytics/overview', { query: { range } })
}

export function fetchContentPerformance(params: {
  range: AnalyticsRange
  type?: ContentPerformanceType
  sort?: ContentPerformanceSort
}): Promise<ContentPerformance> {
  return request<ContentPerformance>('/analytics/content', { query: params })
}
