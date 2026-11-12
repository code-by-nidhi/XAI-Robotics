import { CardBody } from '../../components/common/Card'
import { formatCount } from '../../lib/format'

export interface RankedRow {
  key: string
  label: string
  detail?: string
  href?: string
  value: number
}

/** A top-N list with a bar per row, scaled to the largest. */
export function RankedList({ rows, unit, caption }: { rows: RankedRow[]; unit: string; caption: string }) {
  // The first row is the largest (the API sorts), but guard an all-zero list.
  const max = Math.max(1, ...rows.map((row) => row.value))

  return (
    <CardBody>
      <ol className="space-y-3" aria-label={caption}>
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm">
                {row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-800 hover:text-primary-700 hover:underline"
                  >
                    {row.label}
                  </a>
                ) : (
                  <span className="font-medium text-slate-800">{row.label}</span>
                )}
                {row.detail && <span className="ml-2 text-xs text-slate-400">{row.detail}</span>}
              </span>
              <span className="shrink-0 text-sm font-semibold text-slate-900">
                {formatCount(row.value)}
                <span className="sr-only"> {unit}</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </CardBody>
  )
}
