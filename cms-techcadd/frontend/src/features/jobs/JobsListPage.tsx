import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import type { Column } from '../../components/data/DataTable'
import { Select } from '../../components/form/Select'
import { formatShortDate } from '../../lib/format'
import type { Job } from '../../types'
import { ContentList } from '../shared/ContentList'
import { EMPLOYMENT_OPTIONS, WORK_MODE_OPTIONS } from './jobSchema'
import { jobHooks } from './useJobs'

const labelFor = (options: { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value

/** Today as yyyy-MM-dd in local time, to compare with a closing date. */
function today(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const COLUMNS: Column<Job>[] = [
  {
    id: 'title',
    header: 'Role',
    primary: true,
    sortable: true,
    cell: (job) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{job.title}</p>
        <p className="truncate text-xs text-slate-400">
          {[job.department, job.location].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    hideBelow: 'lg',
    cell: (job) => (
      <span className="whitespace-nowrap text-slate-600">
        {labelFor(EMPLOYMENT_OPTIONS, job.employmentType)} · {labelFor(WORK_MODE_OPTIONS, job.workMode)}
      </span>
    ),
  },
  {
    id: 'applications',
    header: 'Applications',
    align: 'right',
    hideBelow: 'md',
    cell: (job) =>
      job.applications ? (
        <Link
          to={`/applications?jobId=${encodeURIComponent(job.id)}`}
          onClick={(event) => event.stopPropagation()}
          className="font-medium text-primary-700 tabular-nums hover:text-primary-800"
        >
          {job.applications}
        </Link>
      ) : (
        <span className="text-slate-400 tabular-nums">0</span>
      ),
  },
  {
    id: 'closingDate',
    header: 'Closes',
    sortable: true,
    hideBelow: 'lg',
    cell: (job) =>
      !job.closingDate ? (
        <span className="text-slate-400">Open</span>
      ) : job.closingDate < today() ? (
        <Badge tone="neutral">Closed {formatShortDate(job.closingDate)}</Badge>
      ) : (
        <span className="whitespace-nowrap text-slate-500">{formatShortDate(job.closingDate)}</span>
      ),
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    cell: (job) => <ContentStatusBadge status={job.status} />,
  },
]

export default function JobsListPage() {
  return (
    <ContentList
      title="Jobs"
      nouns={['job', 'jobs']}
      segment="jobs"
      siteModule="jobs"
      hooks={jobHooks}
      columns={COLUMNS}
      labelOf={(job) => job.title}
      extraFilterKeys={['employmentType']}
      renderFilters={(list) => (
        <div className="w-40">
          <Select
            aria-label="Filter by employment type"
            value={list.filters.employmentType ?? ''}
            onChange={(event) => list.setFilter('employmentType', event.target.value || undefined)}
            options={EMPLOYMENT_OPTIONS}
            placeholder="Any type"
          />
        </div>
      )}
      searchPlaceholder="Search by title, department or location"
      emptyIcon={Briefcase}
      emptyDescription="Post an opening to list it on the careers page."
      addLabel="Add Job"
    />
  )
}
