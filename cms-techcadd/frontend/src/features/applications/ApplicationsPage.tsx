import { useEffect, useMemo } from 'react'
import { Inbox, ShieldOff } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, jobsApi } from '../../api'
import { ApplicationStatusBadge } from '../../components/common/Badge'
import { Card } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar, type ActiveFilter } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Tabs } from '../../components/data/Tabs'
import { Alert } from '../../components/feedback/Alert'
import { Select } from '../../components/form/Select'
import { PageHeader } from '../../components/layout/PageHeader'
import { useListParams } from '../../hooks/useListParams'
import { useUrlState } from '../../hooks/useUrlState'
import { formatShortDate } from '../../lib/format'
import type { JobApplication } from '../../types'
import { ApplicationDrawer } from './ApplicationDrawer'
import { APPLICATION_STATUS_OPTIONS } from './applicationMeta'
import { applicationHooks } from './useApplications'

const FILTER_KEYS = ['status', 'jobId'] as const

const TABS = [{ value: '', label: 'All' }, ...APPLICATION_STATUS_OPTIONS]

export default function ApplicationsPage() {
  const url = useUrlState()
  const client = useQueryClient()
  const list = useListParams({
    filterKeys: FILTER_KEYS,
    defaultSort: { field: 'createdAt', dir: 'desc' },
  })

  const query = applicationHooks.useList(list.params)

  /*
    The open application lives in the URL, not in component state: the
    new-application alert email links to /applications?open=<id>, and that has
    to work whether or not the row is on the page being shown.
  */
  const openId = url.get('open')
  const opened = applicationHooks.useOne(openId)

  // Opening a new application moves it to "reviewing" on the server, so the
  // list (and the dashboard's unreviewed count) is stale once it has loaded.
  const openedId = opened.data?.id
  useEffect(() => {
    if (!openedId) return
    void client.invalidateQueries({ queryKey: ['applications', 'list'] })
    void client.invalidateQueries({ queryKey: ['dashboard'] })
  }, [openedId, client])

  const jobs = useQuery({
    queryKey: ['jobs', 'list', { page: 1, pageSize: 200, picker: true }],
    queryFn: () => jobsApi.list({ page: 1, pageSize: 200, sort: { field: 'title', dir: 'asc' } }),
  })
  const jobOptions = (jobs.data?.items ?? []).map((job) => ({ value: job.id, label: job.title }))

  const columns = useMemo<Column<JobApplication>[]>(
    () => [
      {
        id: 'name',
        header: 'Applicant',
        primary: true,
        sortable: true,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{row.name}</p>
            <p className="truncate text-xs text-slate-400">{row.email}</p>
          </div>
        ),
      },
      {
        id: 'jobTitle',
        header: 'Position',
        sortable: true,
        cell: (row) => <span className="text-slate-700">{row.jobTitle}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        cell: (row) => <ApplicationStatusBadge status={row.status} />,
      },
      {
        id: 'cv',
        header: 'CV',
        hideBelow: 'xl',
        cell: (row) => (
          <span className="block max-w-48 truncate text-xs text-slate-500">
            {row.cv.filename || '—'}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Received',
        sortable: true,
        hideBelow: 'lg',
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-500">{formatShortDate(row.createdAt)}</span>
        ),
      },
    ],
    [],
  )

  const jobFilterLabel = jobOptions.find((option) => option.value === list.filters.jobId)?.label
  const activeFilters: ActiveFilter[] = list.filters.jobId
    ? [
        {
          key: 'jobId',
          label: 'Position',
          value: jobFilterLabel ?? 'Selected job',
          onRemove: () => list.setFilter('jobId', undefined),
        },
      ]
    : []

  const rows = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const forbidden = query.error instanceof ApiError && query.error.status === 403

  const closeDrawer = () => url.set({ open: undefined }, { resetPage: false })

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Applications" />
        <Card>
          <EmptyState
            icon={ShieldOff}
            title="Applications are for administrators"
            description="They hold applicants' contact details and CVs, so only admin accounts can open them. Ask an administrator if you need access."
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description={
          query.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'application' : 'applications'}${list.filters.status ? '' : ' in total'}`
        }
      />

      {openId && opened.error && (
        <Alert tone="error" title="That application could not be opened" onDismiss={closeDrawer}>
          {opened.error instanceof ApiError && opened.error.status === 404
            ? 'It may have been deleted.'
            : (opened.error as Error).message}
        </Alert>
      )}

      <Card flush>
        <Tabs
          value={list.filters.status ?? ''}
          onValueChange={(value) => list.setFilter('status', value || undefined)}
          items={TABS}
        />

        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search by name, email, position or location"
          activeFilters={activeFilters}
          onClearAll={() => list.setFilter('jobId', undefined)}
          filters={
            <div className="w-full sm:w-64">
              <Select
                aria-label="Filter by position"
                value={list.filters.jobId ?? ''}
                onChange={(event) => list.setFilter('jobId', event.target.value || undefined)}
                options={jobOptions}
                placeholder="All positions"
              />
            </div>
          }
        />

        <DataTable
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Job applications with the position, status and date received"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          onRowClick={(row) => url.set({ open: row.id }, { resetPage: false })}
          emptyIcon={Inbox}
          emptyTitle={
            list.search || list.activeFilterCount > 0 ? 'No matching applications' : 'No applications yet'
          }
          emptyDescription={
            list.search || list.activeFilterCount > 0
              ? 'Try a different search or filter.'
              : 'Applications sent from the careers page on the website will arrive here.'
          }
        />

        {total > 0 && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </Card>

      {opened.data && openId === opened.data.id && (
        <ApplicationDrawer key={opened.data.id} application={opened.data} onClose={closeDrawer} />
      )}
    </div>
  )
}
