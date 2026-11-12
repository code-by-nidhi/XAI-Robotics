import { Link } from 'react-router-dom'
import { Briefcase, FileText, History, LayoutGrid, Newspaper, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useRecentActivity, type ActivityEntry } from '../../features/dashboard/useDashboard'
import { formatShortDate } from '../../lib/format'
import { Card, CardBody, CardHeader } from '../common/Card'
import { EmptyState } from '../common/EmptyState'

interface KindMeta {
  icon: LucideIcon
  className: string
}

// Keyed by the module's URL segment, which is what the API reports as `kind`.
const kindMeta: Partial<Record<ActivityEntry['kind'], KindMeta & { label: string }>> = {
  blogs: { label: 'Blog', icon: Newspaper, className: 'bg-emerald-50 text-emerald-600' },
  'case-studies': { label: 'Case study', icon: Trophy, className: 'bg-primary-50 text-primary-600' },
  portfolio: { label: 'Portfolio item', icon: LayoutGrid, className: 'bg-violet-50 text-violet-600' },
  jobs: { label: 'Job', icon: Briefcase, className: 'bg-rose-50 text-rose-600' },
}

// A kind added to the API before it is given an icon here still gets listed.
const fallbackMeta: KindMeta & { label?: string } = { icon: FileText, className: 'bg-primary-50 text-primary-600' }

export function RecentActivity() {
  const { data } = useRecentActivity()
  const recentActivities = data ?? []

  return (
    <Card flush className="h-full">
      <CardHeader title="Recent Activity" subtitle="Latest changes made in the CMS" />
      {recentActivities.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Edits made in the CMS will be logged here as they happen."
        />
      ) : (
      <CardBody>
        <ol className="relative space-y-5">
          {recentActivities.map((activity, index) => {
            const { icon: Icon, className, label } = kindMeta[activity.kind] ?? fallbackMeta
            const isLast = index === recentActivities.length - 1

            return (
              <li key={activity.id} className="relative flex gap-3">
                {!isLast && (
                  <span
                    className="absolute top-9 left-4 h-full w-px -translate-x-1/2 bg-slate-100"
                    aria-hidden="true"
                  />
                )}

                <span
                  className={`relative grid size-8 shrink-0 place-items-center rounded-full ${className}`}
                >
                  <Icon size={15} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1 pb-1">
                  <p className="truncate text-sm text-slate-700">
                    {/* Kinds are the CMS's own URL segments, so every known
                        kind has an edit route; an unknown one is not linked. */}
                    {kindMeta[activity.kind] ? (
                      <Link
                        to={`/${activity.kind}/${activity.id}/edit`}
                        className="font-semibold text-slate-900 hover:text-primary-700 hover:underline"
                      >
                        {activity.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900">{activity.title}</span>
                    )}
                  </p>
                  {/* The record's own timestamp. Who made the edit is in the
                      activity log, which the summary also carries. */}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {label ?? activity.kind} updated · {formatShortDate(activity.updatedAt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardBody>
      )}
    </Card>
  )
}
