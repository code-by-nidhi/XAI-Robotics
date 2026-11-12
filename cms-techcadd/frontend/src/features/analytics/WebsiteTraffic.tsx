import { ChartLine, Eye, FileStack, Mail, Send } from 'lucide-react'

import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonCards } from '../../components/feedback/Skeleton'
import { SITE_URL } from '../../config/siteMap'
import { useUrlState } from '../../hooks/useUrlState'
import { cn } from '../../lib/cn'
import { formatCount, formatShortDate } from '../../lib/format'
import { ContentPerformance } from './ContentPerformance'
import { MetricCard } from './MetricCard'
import { RankedList } from './RankedList'
import { RANGES, parseRange, useAnalyticsOverview } from './useAnalytics'
import { ViewsChart } from './ViewsChart'

// Also the anchor: /#website-traffic jumps straight to this section.
const WEBSITE_TRAFFIC_ID = 'website-traffic'

/**
 * The dashboard's traffic section: views, what was read and where enquiries
 * came from, over a 7/30/90-day range kept in the query string.
 *
 * There is no enquiries figure here on purpose — the dashboard's stat cards
 * already show the enquiry total, and two different enquiry numbers a scroll
 * apart read as a contradiction. The per-service breakdown below is the part
 * only this range can answer.
 */
export function WebsiteTraffic() {
  const url = useUrlState()
  const range = parseRange(url.get('range'))
  const overview = useAnalyticsOverview(range)
  const data = overview.data

  return (
    <section
      id={WEBSITE_TRAFFIC_ID}
      aria-labelledby={`${WEBSITE_TRAFFIC_ID}-heading`}
      className="scroll-mt-6 space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${WEBSITE_TRAFFIC_ID}-heading`} className="text-lg font-semibold text-slate-900">
            Website traffic
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {data?.trackingSince
              ? `Page views on the website, counted since ${formatShortDate(data.trackingSince)}.`
              : 'Page views on the website, what people read and where enquiries came from.'}
          </p>
        </div>
        <div
          role="group"
          aria-label="Date range"
          className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
        >
          {RANGES.map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={range === days}
              // 30 is the default, so it is left out of the URL.
              onClick={() => url.set({ range: days === 30 ? undefined : days })}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                range === days ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {overview.error && (
        <Alert tone="error" title="Could not load website traffic">
          {(overview.error as Error).message}
        </Alert>
      )}

      {overview.isLoading ? (
        <SkeletonCards count={3} />
      ) : data ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <li>
            <MetricCard
              label="Page views"
              icon={Eye}
              value={data.stats.views.value}
              change={data.stats.views}
              days={range}
            />
          </li>
          <li>
            <MetricCard label="Pages viewed" icon={FileStack} value={data.stats.pages} hint="Distinct addresses visited" />
          </li>
          <li>
            <MetricCard
              label="Published"
              icon={Send}
              value={data.stats.published.value}
              change={data.stats.published}
              days={range}
              hint={`${data.stats.published.blogs} blogs · ${data.stats.published.caseStudies} case studies · ${data.stats.published.portfolio} portfolio`}
            />
          </li>
        </ul>
      ) : null}

      {data && (
        <Card flush>
          <CardHeader
            title={`Page views — last ${range} days`}
            subtitle={
              data.trackingSince
                ? `${formatCount(data.stats.views.value)} views in this period`
                : 'Nothing has been recorded yet'
            }
          />
          <CardBody>
            {data.stats.views.value === 0 ? (
              <EmptyState
                icon={ChartLine}
                title={data.trackingSince ? 'No views in this period' : 'No page views recorded yet'}
                description={
                  data.trackingSince
                    ? 'Try a longer range.'
                    : 'Views are counted as soon as people visit the website. Check back once it has had some traffic.'
                }
              />
            ) : (
              <ViewsChart series={data.series} />
            )}
          </CardBody>
        </Card>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card flush>
            <CardHeader title="Top pages" subtitle={`Most viewed in the last ${range} days`} />
            {data.topPages.length === 0 ? (
              <EmptyState icon={FileStack} title="No pages viewed yet" />
            ) : (
              <RankedList
                caption="Most viewed pages"
                rows={data.topPages.map((page) => ({
                  key: page.path,
                  label: page.label,
                  detail: page.label === page.path ? undefined : page.path,
                  href: `${SITE_URL}${page.path}`,
                  value: page.views,
                }))}
                unit="views"
              />
            )}
          </Card>

          <Card flush>
            <CardHeader title="Enquiries by service" subtitle={`Received in the last ${range} days`} />
            {data.enquiriesByService.length === 0 ? (
              <EmptyState icon={Mail} title="No enquiries in this period" />
            ) : (
              <RankedList
                caption="Enquiries by service"
                rows={data.enquiriesByService.map((row) => ({
                  key: row.service,
                  label: row.service,
                  value: row.count,
                }))}
                unit="enquiries"
              />
            )}
          </Card>
        </div>
      )}

      <ContentPerformance range={range} />
    </section>
  )
}
