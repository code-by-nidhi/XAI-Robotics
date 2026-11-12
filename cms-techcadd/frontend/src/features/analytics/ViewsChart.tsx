import { useState } from 'react'

import { cn } from '../../lib/cn'

interface ViewsChartProps {
  /** One point per day, oldest first, gaps already filled by the API. */
  series: { date: string; views: number }[]
}

/** Parse as local midnight; `new Date('2026-08-11')` is UTC and can land on the day before. */
function localDay(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const shortDay = (date: string) =>
  localDay(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
const longDay = (date: string) =>
  localDay(date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long' })

/** A round axis top: 1, 2, 5 or 10 times a power of ten. */
function niceMax(value: number): number {
  if (value <= 4) return 4
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 5, 10].find((m) => m * power >= value) ?? 10
  return step * power
}

/**
 * Daily views as bars, in the same visual language as the dashboard's
 * enquiries chart. Ninety bars do not fit ninety labels, so the x-axis names
 * only the first, middle and last day; every day is still in the hover label
 * and in the table for screen readers.
 */
export function ViewsChart({ series }: ViewsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const values = series.map((point) => point.views)
  // The caller shows an empty state for an all-zero series; this guards the
  // division regardless.
  const max = niceMax(values.length > 0 ? Math.max(...values) : 0)
  const ticks = [max, max * 0.75, max * 0.5, max * 0.25, 0]
  const dense = series.length > 31
  const labelled = new Set([0, Math.floor((series.length - 1) / 2), series.length - 1])

  return (
    <figure className="m-0">
      <div className="relative pl-10" aria-hidden="true">
        <div className="absolute inset-0 flex flex-col justify-between">
          {ticks.map((tick) => (
            <div key={tick} className="flex h-0 items-center gap-2">
              <span className="w-8 shrink-0 text-right text-[10px] leading-none text-slate-400">
                {Number.isInteger(tick) ? tick.toLocaleString('en-IN') : ''}
              </span>
              <span className={cn('h-px flex-1', tick === 0 ? 'bg-slate-200' : 'bg-slate-100')} />
            </div>
          ))}
        </div>

        <div className={cn('relative flex h-52 items-end', dense ? 'gap-px' : 'gap-1 sm:gap-1.5')}>
          {series.map((point, index) => {
            const isHovered = hovered === index
            return (
              <div
                key={point.date}
                className="relative flex h-full min-w-0 flex-1 flex-col justify-end"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center whitespace-nowrap shadow-lg">
                    <span className="block text-[11px] font-semibold text-white">
                      {point.views.toLocaleString('en-IN')} {point.views === 1 ? 'view' : 'views'}
                    </span>
                    <span className="block text-[10px] text-slate-300">{longDay(point.date)}</span>
                  </div>
                )}
                <div
                  className={cn(
                    'mx-auto w-full max-w-10 rounded-t-sm transition-colors',
                    isHovered ? 'bg-primary-600' : 'bg-primary-500',
                    // A zero day keeps a hairline so the run of days stays legible.
                    point.views === 0 && 'bg-slate-200',
                  )}
                  style={{ height: point.views === 0 ? '2px' : `${(point.views / max) * 100}%` }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex pl-10" aria-hidden="true">
        {series.map((point, index) => (
          <span key={point.date} className="relative min-w-0 flex-1 text-center text-[11px] text-slate-400">
            {(series.length <= 14 || labelled.has(index)) && (
              <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                {shortDay(point.date)}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="h-4" aria-hidden="true" />

      <figcaption className="sr-only">Page views per day</figcaption>

      {/* sr-only on a wrapper, not the table — see EnquiriesChart for why. */}
      <div className="sr-only">
        <table>
          <caption>Page views per day</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Views</th>
            </tr>
          </thead>
          <tbody>
            {series.map((point) => (
              <tr key={point.date}>
                <th scope="row">{longDay(point.date)}</th>
                <td>{point.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
