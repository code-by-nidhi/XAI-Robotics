import { Link } from 'react-router-dom'
import { ExternalLink, FileStack } from 'lucide-react'

import type {
  AnalyticsRange,
  ContentPerformanceSort,
  ContentPerformanceType,
} from '../../api/resources/analytics'
import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import { Card, CardHeader } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Tabs } from '../../components/data/Tabs'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonTable } from '../../components/feedback/Skeleton'
import { Select } from '../../components/form/Select'
import { SITE_URL } from '../../config/siteMap'
import { useUrlState } from '../../hooks/useUrlState'
import { cn } from '../../lib/cn'
import { formatCount, formatShortDate } from '../../lib/format'
import type { ContentStatus } from '../../types'
import { useContentPerformance } from './useAnalytics'

const TYPE_TABS = [
  { value: '', label: 'All content' },
  { value: 'blog', label: 'Blogs' },
  { value: 'case_study', label: 'Case studies' },
]

const SORT_OPTIONS: { value: ContentPerformanceSort; label: string }[] = [
  { value: 'range', label: 'Views in this period' },
  { value: 'total', label: 'All-time views' },
  { value: 'published', label: 'Newest first' },
  { value: 'title', label: 'Title A–Z' },
]

/** Views of each blog post and case study. Type and sort live in the query string. */
export function ContentPerformance({ range }: { range: AnalyticsRange }) {
  const url = useUrlState()
  const typeParam = url.get('type')
  const type: ContentPerformanceType | undefined =
    typeParam === 'blog' || typeParam === 'case_study' ? typeParam : undefined
  const sort: ContentPerformanceSort =
    SORT_OPTIONS.find((option) => option.value === url.get('sort'))?.value ?? 'range'

  const content = useContentPerformance({ range, type, sort })

  return (
    <Card flush>
      <CardHeader
        title="Content performance"
        subtitle="Views of each article and case study"
        action={
          <div className="w-48">
            <Select
              aria-label="Sort content by"
              value={sort}
              onChange={(event) =>
                url.set({ sort: event.target.value === 'range' ? undefined : event.target.value })
              }
              options={SORT_OPTIONS}
            />
          </div>
        }
      />
      <Tabs
        value={type ?? ''}
        onValueChange={(value) => url.set({ type: value || undefined })}
        items={TYPE_TABS}
      />
      {content.data && content.data.rows.length > 0 && (
        <dl className="grid grid-cols-2 gap-4 border-b border-slate-100 px-5 py-4 sm:grid-cols-4">
          <Figure label={`Views (${range} days)`} value={formatCount(content.data.stats.rangeViews)} />
          <Figure label="All-time views" value={formatCount(content.data.stats.totalViews)} />
          <Figure label="Average per live item" value={formatCount(content.data.stats.average)} />
          <Figure
            label="Most read"
            value={content.data.stats.top ? content.data.stats.top.title : '—'}
            small
          />
        </dl>
      )}
      <ContentTable query={content} range={range} />
    </Card>
  )
}

function Figure({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={cn('mt-0.5 truncate font-semibold text-slate-900', small ? 'text-sm' : 'text-lg')} title={value}>
        {value}
      </dd>
    </div>
  )
}

function ContentTable({
  query,
  range,
}: {
  query: ReturnType<typeof useContentPerformance>
  range: number
}) {
  if (query.isLoading) return <SkeletonTable />
  if (query.error) {
    return (
      <div className="p-5">
        <Alert tone="error" title="Could not load content performance">
          {(query.error as Error).message}
        </Alert>
      </div>
    )
  }

  const rows = query.data?.rows ?? []
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FileStack}
        title="No content yet"
        description="Blogs and case studies appear here with their view counts."
      />
    )
  }

  return (
    <div className="scrollbar-slim overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Views of each blog post and case study, in the last {range} days and all time
        </caption>
        <thead className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-3">Title</th>
            <th scope="col" className="hidden px-3 py-3 md:table-cell">Type</th>
            <th scope="col" className="hidden px-3 py-3 lg:table-cell">Status</th>
            <th scope="col" className="px-3 py-3 text-right">{range} days</th>
            <th scope="col" className="px-3 py-3 text-right">All time</th>
            <th scope="col" className="hidden px-3 py-3 lg:table-cell">Published</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">Links</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const editPath = row.type === 'blog' ? `/blogs/${row.id}/edit` : `/case-studies/${row.id}/edit`
            const live = row.status === 'published' || row.status === 'scheduled'
            return (
              <tr key={`${row.type}-${row.id}`} className="hover:bg-slate-50/60">
                <th scope="row" className="max-w-xs px-5 py-3 font-medium text-slate-900">
                  <Link to={editPath} className="line-clamp-2 hover:text-primary-700 hover:underline">
                    {row.title}
                  </Link>
                </th>
                <td className="hidden px-3 py-3 md:table-cell">
                  <Badge tone={row.type === 'blog' ? 'info' : 'primary'}>
                    {row.type === 'blog' ? 'Blog' : 'Case study'}
                  </Badge>
                </td>
                <td className="hidden px-3 py-3 lg:table-cell">
                  <ContentStatusBadge status={row.status as ContentStatus} />
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-900">{formatCount(row.rangeViews)}</td>
                <td className="px-3 py-3 text-right text-slate-600">{formatCount(row.totalViews)}</td>
                <td className="hidden px-3 py-3 whitespace-nowrap text-slate-500 lg:table-cell">
                  {row.publishedAt ? formatShortDate(row.publishedAt) : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  {live && (
                    <a
                      href={`${SITE_URL}${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${row.title} on the website`}
                      className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
