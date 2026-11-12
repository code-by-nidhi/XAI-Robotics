import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'

import type { ChangeStat } from '../../api/resources/analytics'
import { cn } from '../../lib/cn'
import { formatCount } from '../../lib/format'

function ChangeBadge({ change }: { change: number }) {
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        direction === 'up' && 'bg-emerald-50 text-emerald-600',
        direction === 'down' && 'bg-rose-50 text-rose-600',
        direction === 'flat' && 'bg-slate-100 text-slate-500',
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {change > 0 ? '+' : ''}
      {change}%
    </span>
  )
}

/**
 * A figure for the selected range, styled like the dashboard's StatCard.
 *
 * Not a StatCard itself: these are not links, and they carry a real
 * period-on-period change where StatCard's totals have none.
 */
export function MetricCard({
  label,
  icon: Icon,
  value,
  change,
  days,
  hint,
}: {
  label: string
  icon: LucideIcon
  value: number
  change?: ChangeStat
  days?: number
  hint?: string
}) {
  // A null change means the previous period had nothing to compare against —
  // no badge rather than an invented "+100%".
  const delta = change?.change ?? null

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{formatCount(value)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {delta !== null && <ChangeBadge change={delta} />}
        {delta !== null && days && <span className="text-xs text-slate-500">vs. previous {days} days</span>}
        {change && delta === null && <span className="text-xs text-slate-400">No earlier period to compare</span>}
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </div>
  )
}
