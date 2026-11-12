import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, MoreHorizontal, Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

import { ApiError, type ListParams, type ListResult } from '../../api'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar, type ActiveFilter } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Tabs } from '../../components/data/Tabs'
import { PageHeader } from '../../components/layout/PageHeader'
import { publicUrlFor } from '../../config/siteMap'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import { STATUS_TABS } from './statusOptions'

interface ListHooks<T> {
  useList(params: ListParams): UseQueryResult<ListResult<T>>
  useRemove(): UseMutationResult<void, Error, string[]>
}

interface ContentListProps<T extends { id: string; status: string }> {
  title: string
  /** Singular and plural nouns for counts and dialogs: ["case study", "case studies"]. */
  nouns: [string, string]
  /** The CMS route segment, e.g. "case-studies". */
  segment: string
  /** SITE_MAP key, for "View on site". Omit when records have no page of their own. */
  siteModule?: string
  hooks: ListHooks<T>
  columns: Column<T>[]
  /** How a row is named in menus and the delete dialog. */
  labelOf: (row: T) => string
  /** Query-string filters beyond status. */
  extraFilterKeys?: readonly string[]
  /** Selects rendered beside the search box; receive the list state to read and set. */
  renderFilters?: (list: ReturnType<typeof useListParams>) => ReactNode
  activeFilters?: (list: ReturnType<typeof useListParams>) => ActiveFilter[]
  searchPlaceholder: string
  emptyIcon: LucideIcon
  emptyDescription: string
  addLabel: string
  defaultSort?: { field: string; dir: 'asc' | 'desc' }
}

/**
 * The list page of a website content module.
 *
 * Case studies, portfolio and jobs differ only in their columns and filters;
 * tabs, search, selection, bulk delete, row menu and pagination behave
 * identically, so they are written once here. Blogs keeps
 * its own page as the reference implementation this was extracted from.
 */
export function ContentList<T extends { id: string; status: string }>({
  title,
  nouns: [singular, plural],
  segment,
  siteModule,
  hooks,
  columns,
  labelOf,
  extraFilterKeys = [],
  renderFilters,
  activeFilters,
  searchPlaceholder,
  emptyIcon,
  emptyDescription,
  addLabel,
  defaultSort = { field: 'sortOrder', dir: 'asc' },
}: ContentListProps<T>) {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const [filterKeys] = useState(() => ['status', ...extraFilterKeys])
  const list = useListParams({ filterKeys, defaultSort })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const query = hooks.useList(list.params)
  const remove = hooks.useRemove()

  const count = (n: number) => `${n} ${n === 1 ? singular : plural}`
  const editPath = (row: T) => `/${segment}/${row.id}/edit`

  async function deleteRows(ids: string[], label: string) {
    const confirmed = await confirm({
      title: `Delete ${label}?`,
      description: 'This cannot be undone. If it is on the website, it disappears from it.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync(ids)
      setSelectedIds([])
      toast.success(`Deleted ${label}.`)
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  const rows = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const filtered = Boolean(list.search) || list.activeFilterCount > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={query.isLoading ? 'Loading…' : `${count(total)} ${filtered ? 'match' : 'in total'}`}
        actions={
          <Link to={`/${segment}/new`}>
            <Button icon={Plus}>{addLabel}</Button>
          </Link>
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
          searchPlaceholder={searchPlaceholder}
          filters={renderFilters?.(list)}
          activeFilters={activeFilters?.(list)}
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => deleteRows(selectedIds, count(selectedIds.length))}
            >
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
          caption={`All ${plural} with their status`}
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => navigate(editPath(row))}
          emptyIcon={emptyIcon}
          emptyTitle={filtered ? `No matching ${plural}` : `No ${plural} yet`}
          emptyDescription={filtered ? 'Try a different search or filter.' : emptyDescription}
          rowActions={(row) => {
            const url = siteModule && row.status === 'published' ? publicUrlFor(siteModule, row) : undefined
            return (
              <DropdownMenu
                trigger={
                  <Button variant="ghost" size="sm" aria-label={`Actions for ${labelOf(row)}`}>
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </Button>
                }
              >
                <DropdownItem icon={Pencil} onSelect={() => navigate(editPath(row))}>
                  Edit
                </DropdownItem>
                {url && (
                  <DropdownItem icon={ExternalLink} onSelect={() => window.open(url, '_blank', 'noopener')}>
                    View on site
                  </DropdownItem>
                )}
                <DropdownSeparator />
                <DropdownItem icon={Trash2} tone="danger" onSelect={() => deleteRows([row.id], labelOf(row))}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            )
          }}
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
    </div>
  )
}
