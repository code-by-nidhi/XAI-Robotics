import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, Inbox, MoreHorizontal, Trash2, UserPlus } from 'lucide-react'

import { ApiError, enquiriesApi } from '../../api'
import { bulkUpdateEnquiries } from '../../api/resources/enquiries'
import { EnquiryStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
} from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar, type ActiveFilter } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Tabs } from '../../components/data/Tabs'
import { DateRangePicker } from '../../components/form/DatePicker'
import { Select } from '../../components/form/Select'
import { PageHeader } from '../../components/layout/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import { useUrlState } from '../../hooks/useUrlState'
import { downloadCsv, toCsv, type CsvColumn } from '../../lib/csv'
import { formatShortDate } from '../../lib/format'
import type { EnquiryRecord, EnquiryStatus } from '../../types'
import { EnquiryDrawer } from './EnquiryDrawer'
import { STATUS_OPTIONS, STATUS_TABS, statusLabel } from './enquiryMeta'
import { enquiryHooks, userRefHooks } from './useEnquiries'

const FILTER_KEYS = ['status', 'assigneeId', 'createdAtFrom', 'createdAtTo'] as const

const CSV_COLUMNS: CsvColumn<EnquiryRecord>[] = [
  { header: 'Reference', value: (row) => row.id },
  { header: 'Received', value: (row) => row.createdAt.slice(0, 16) },
  { header: 'Name', value: (row) => row.name },
  { header: 'Email', value: (row) => row.email },
  { header: 'Phone', value: (row) => row.phone ?? '' },
  { header: 'Company', value: (row) => row.company ?? '' },
  { header: 'Service', value: (row) => row.service ?? '' },
  { header: 'Subject', value: (row) => row.subject ?? '' },
  { header: 'Status', value: (row) => statusLabel(row.status) },
  { header: 'Assigned to', value: (row) => row.assignee?.name ?? '' },
  { header: 'Message', value: (row) => row.message },
  { header: 'Notes', value: (row) => row.notes.length },
]

export default function EnquiriesListPage() {
  const toast = useToast()
  const { session } = useAuth()
  const confirm = useConfirm()
  const client = useQueryClient()
  const url = useUrlState()

  const list = useListParams({
    filterKeys: FILTER_KEYS,
    defaultSort: { field: 'createdAt', dir: 'desc' },
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [bulkPending, setBulkPending] = useState(false)

  // The drawer is driven by ?open=<id>, which is also what the new-enquiry
  // alert email links to — so a link from the inbox opens the right enquiry
  // even when it is not on the first page of the list.
  const openId = url.get('open') ?? null
  const setOpenId = (id: string | null) => url.set({ open: id ?? undefined }, { resetPage: false })

  const query = enquiryHooks.useList(list.params)
  const update = enquiryHooks.useUpdate()
  const remove = enquiryHooks.useRemove()
  const detail = enquiryHooks.useOne(openId ?? undefined)

  const users = userRefHooks.useList({ page: 1, pageSize: 200 })
  const assigneeOptions = useMemo(
    () => (users.data?.items ?? []).map((u) => ({ value: u.id, label: u.name })),
    [users.data],
  )

  // Opening an enquiry is reading it: the API moves a new one to "read". The
  // list, the bell and the dashboard counts have to hear about that.
  const openedAt = detail.dataUpdatedAt
  useEffect(() => {
    if (!openedAt) return
    void client.invalidateQueries({ queryKey: ['enquiries', 'list'] })
    void client.invalidateQueries({ queryKey: ['notifications'] })
    void client.invalidateQueries({ queryKey: ['dashboard'] })
  }, [openedAt, client])

  const rows = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const openEnquiry = detail.data ?? rows.find((row) => row.id === openId) ?? null

  useEffect(() => {
    if (detail.error) toast.error('Could not open that enquiry', { description: detail.error.message })
  }, [detail.error, toast])

  const columns = useMemo<Column<EnquiryRecord>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        primary: true,
        sortable: true,
        cell: (row) => (
          <div className="min-w-0">
            <p
              className={
                row.status === 'new'
                  ? 'truncate font-semibold text-slate-900'
                  : 'truncate font-medium text-slate-800'
              }
            >
              {row.name}
            </p>
            <p className="truncate text-xs text-slate-400">{row.email}</p>
          </div>
        ),
      },
      {
        id: 'company',
        header: 'Company',
        sortable: true,
        hideBelow: 'xl',
        cell: (row) => row.company || <span className="text-slate-400">—</span>,
      },
      {
        id: 'service',
        header: 'Service',
        sortable: true,
        hideBelow: 'lg',
        cell: (row) => row.service || <span className="text-slate-400">Not specified</span>,
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        cell: (row) => <EnquiryStatusBadge status={row.status} />,
      },
      {
        id: 'assigneeId',
        header: 'Assigned',
        hideBelow: 'lg',
        cell: (row) => row.assignee?.name ?? <span className="text-slate-400">Unassigned</span>,
      },
      {
        id: 'createdAt',
        header: 'Received',
        sortable: true,
        hideBelow: 'md',
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-500">{formatShortDate(row.createdAt)}</span>
        ),
      },
    ],
    [],
  )

  // Status is chosen with the tabs, so it is not repeated as a removable chip.
  const activeFilters: ActiveFilter[] = (['assigneeId', 'createdAtFrom', 'createdAtTo'] as const).flatMap(
    (key) => {
      const value = list.filters[key]
      if (!value) return []
      const labels = { assigneeId: 'Assigned', createdAtFrom: 'From', createdAtTo: 'To' }
      return [
        {
          key,
          label: labels[key],
          value:
            key === 'assigneeId'
              ? (assigneeOptions.find((option) => option.value === value)?.label ?? value)
              : value,
          onRemove: () => list.setFilter(key, undefined),
        },
      ]
    },
  )

  async function bulk(input: { status?: EnquiryStatus; assigneeId?: string }, message: string) {
    setBulkPending(true)
    try {
      await bulkUpdateEnquiries({ ids: selectedIds, ...input })
      await Promise.all([
        client.invalidateQueries({ queryKey: ['enquiries'] }),
        client.invalidateQueries({ queryKey: ['notifications'] }),
        client.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      toast.success(message)
      setSelectedIds([])
    } catch (error) {
      toast.error('Could not update the selection', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    } finally {
      setBulkPending(false)
    }
  }

  async function bulkDelete() {
    const label = `${selectedIds.length} ${selectedIds.length === 1 ? 'enquiry' : 'enquiries'}`
    const confirmed = await confirm({
      title: `Delete ${label}?`,
      description: 'Deleting removes the record and its notes for good. Archive keeps it out of the inbox instead.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync(selectedIds)
      setSelectedIds([])
      toast.success(`Deleted ${label}.`)
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function exportCsv() {
    setExporting(true)
    try {
      // Export what the filters describe, not just the visible page. 200 is
      // the API's page-size cap, so larger inboxes are fetched page by page.
      const items: EnquiryRecord[] = []
      for (let page = 1; ; page += 1) {
        const batch = await enquiriesApi.list({ ...list.params, page, pageSize: 200 })
        items.push(...batch.items)
        if (batch.items.length === 0 || items.length >= batch.total) break
      }

      if (items.length === 0) {
        toast.info('Nothing to export', { description: 'No enquiries match the current filters.' })
        return
      }

      const stamp = new Date().toISOString().slice(0, 10)
      downloadCsv(`enquiries-${stamp}.csv`, toCsv(items, CSV_COLUMNS))
      toast.success(`Exported ${items.length} ${items.length === 1 ? 'enquiry' : 'enquiries'}.`)
    } catch (error) {
      toast.error('Could not export', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    } finally {
      setExporting(false)
    }
  }

  const filtered = Boolean(list.search) || activeFilters.length > 0 || Boolean(list.filters.status)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description={
          query.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'enquiry' : 'enquiries'} match the current view`
        }
        actions={
          <Button variant="secondary" icon={Download} disabled={exporting} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <Card flush>
        <Tabs
          value={list.filters.status ?? ''}
          onValueChange={(value) => list.setFilter('status', value || undefined)}
          items={STATUS_TABS}
        />

        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search by name, email, phone, company or message"
          activeFilters={activeFilters}
          onClearAll={activeFilters.length > 0 ? () => list.clearFilters() : undefined}
          filters={
            <>
              <Select
                className="h-9 w-auto min-w-36"
                aria-label="Filter by assignee"
                options={assigneeOptions}
                placeholder="Anyone"
                value={list.filters.assigneeId ?? ''}
                onChange={(event) => list.setFilter('assigneeId', event.target.value || undefined)}
              />
              <div className="w-56">
                <DateRangePicker
                  value={{ from: list.filters.createdAtFrom, to: list.filters.createdAtTo }}
                  onChange={(range) => {
                    list.setFilter('createdAtFrom', range.from)
                    list.setFilter('createdAtTo', range.to)
                  }}
                  placeholder="Any date received"
                />
              </div>
            </>
          }
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>

            <DropdownMenu
              align="start"
              trigger={
                <Button variant="secondary" size="sm" disabled={bulkPending}>
                  Set status
                </Button>
              }
            >
              <DropdownLabel>Move to</DropdownLabel>
              {STATUS_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onSelect={() =>
                    bulk({ status: option.value }, `${selectedIds.length} marked as ${option.label}.`)
                  }
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>

            <DropdownMenu
              align="start"
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserPlus}
                  disabled={bulkPending || assigneeOptions.length === 0}
                >
                  Assign
                </Button>
              }
            >
              <DropdownLabel>Assign to</DropdownLabel>
              {assigneeOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onSelect={() =>
                    bulk({ assigneeId: option.value }, `${selectedIds.length} assigned to ${option.label}.`)
                  }
                >
                  {option.label}
                </DropdownItem>
              ))}
              <DropdownSeparator />
              <DropdownItem onSelect={() => bulk({ assigneeId: '' }, `${selectedIds.length} unassigned.`)}>
                Unassign
              </DropdownItem>
            </DropdownMenu>

            <Button variant="secondary" size="sm" icon={Trash2} onClick={bulkDelete}>
              Delete
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Clear selection
            </button>
          </div>
        )}

        <DataTable
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Enquiries with the service they asked about, their status and assignment"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => setOpenId(row.id)}
          emptyIcon={Inbox}
          emptyTitle={filtered ? 'No matching enquiries' : 'No enquiries yet'}
          emptyDescription={
            filtered
              ? 'Try a different search term, another tab, or clear the filters.'
              : 'Enquiries submitted through the website contact form will land here.'
          }
          rowActions={(row) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${row.name}`}>
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
              }
            >
              <DropdownItem onSelect={() => setOpenId(row.id)}>Open details</DropdownItem>
              <DropdownLabel>Set status</DropdownLabel>
              {STATUS_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  disabled={row.status === option.value}
                  onSelect={() =>
                    update
                      .mutateAsync({ id: row.id, input: { status: option.value } })
                      .then(() => toast.success(`Marked as ${option.label}.`))
                      .catch(() => toast.error('Could not update this enquiry'))
                  }
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
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

      <EnquiryDrawer
        enquiry={openId ? openEnquiry : null}
        loading={Boolean(openId) && detail.isLoading && !openEnquiry}
        onOpenChange={(open) => !open && setOpenId(null)}
        assigneeOptions={assigneeOptions}
        currentUserName={session?.name ?? 'XAI Robotics team'}
      />
    </div>
  )
}
