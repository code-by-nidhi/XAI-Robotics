import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  fetchAnalyticsOverview,
  fetchContentPerformance,
  type AnalyticsRange,
  type ContentPerformanceSort,
  type ContentPerformanceType,
} from '../../api/resources/analytics'

export const RANGES: AnalyticsRange[] = [7, 30, 90]

/** Anything else in the URL falls back to 30 days, the same default the API uses. */
export function parseRange(value: string | undefined): AnalyticsRange {
  const n = Number(value)
  return n === 7 || n === 90 ? n : 30
}

// Previous data is kept while a new range loads, so switching range does not
// collapse the page into skeletons and jump the scroll position.
export function useAnalyticsOverview(range: AnalyticsRange) {
  return useQuery({
    queryKey: ['analytics', 'overview', range],
    queryFn: () => fetchAnalyticsOverview(range),
    placeholderData: keepPreviousData,
  })
}

export function useContentPerformance(params: {
  range: AnalyticsRange
  type?: ContentPerformanceType
  sort: ContentPerformanceSort
}) {
  return useQuery({
    queryKey: ['analytics', 'content', params],
    queryFn: () => fetchContentPerformance(params),
    placeholderData: keepPreviousData,
  })
}
