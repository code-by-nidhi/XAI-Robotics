import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquareQuote, MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react'

import { ApiError, type ListParams } from '../../api'
import { assetUrl } from '../../api/client'
import { Avatar } from '../../components/common/Avatar'
import { ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar } from '../../components/data/FilterBar'
import { Select } from '../../components/form/Select'
import { StarRating } from '../../components/form/StarRating'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import type { Testimonial } from '../../types'
import { TESTIMONIAL_STATUS_OPTIONS } from './testimonialSchema'
import { testimonialHooks } from './useTestimonials'

const FILTER_KEYS = ['status', 'featured'] as const

const FEATURED_OPTIONS = [
  { value: '1', label: 'Featured' },
  { value: '0', label: 'Not featured' },
]

/**
 * Every testimonial at once, in the order the website shows them.
 *
 * There are rarely more than a couple of dozen, so paging would only get in
 * the way of reading the order.
 */
const ALL: ListParams = { page: 1, pageSize: 500, sort: { field: 'order', dir: 'asc' } }

export default function TestimonialsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({ filterKeys: FILTER_KEYS })
  const narrowed = Boolean(list.search) || list.activeFilterCount > 0

  const params = useMemo<ListParams>(
    () => ({ ...ALL, search: list.params.search, filters: list.params.filters }),
    [list.params.search, list.params.filters],
  )

  const query = testimonialHooks.useList(params)
  const remove = testimonialHooks.useRemove()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const testimonials = useMemo(() => query.data?.items ?? [], [query.data])

  /** One path for the row menu and the selection toolbar — see FaqsListPage. */
  async function deleteTestimonials(ids: string[], label: string, description?: string) {
    const confirmed = await confirm({
      title: `Delete ${label}?`,
      description,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync(ids)
      setSelectedIds([])
      toast.success(ids.length === 1 ? 'Testimonial deleted.' : `Deleted ${label}.`)
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  const columns: Column<Testimonial>[] = [
    {
      id: 'name',
      header: 'Person',
      cell: (item) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={item.name} src={assetUrl(item.avatar?.url)} size="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-slate-900">
              {item.name}
              {item.featured && (
                <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />
              )}
            </p>
            <p className="truncate text-xs text-slate-500">
              {[item.role, item.company].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'quote',
      header: 'Quote',
      cell: (item) => <p className="max-w-md truncate text-sm text-slate-600">{item.quote}</p>,
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: (item) =>
        item.rating ? (
          <StarRating value={item.rating} readOnly size={14} />
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item) => <ContentStatusBadge status={item.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Quotes from graduates, parents, partner schools and franchise partners, in the order shown here"
        actions={
          <Link to="/testimonials/new">
            <Button icon={Plus}>Add testimonial</Button>
          </Link>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search names, roles and quotes"
          onClearAll={list.activeFilterCount > 0 ? list.clearFilters : undefined}
          filters={
            <>
              <Select
                className="h-9 w-auto min-w-32"
                aria-label="Filter by status"
                options={TESTIMONIAL_STATUS_OPTIONS}
                placeholder="All statuses"
                value={list.filters.status ?? ''}
                onChange={(event) => list.setFilter('status', event.target.value || undefined)}
              />
              <Select
                className="h-9 w-auto min-w-36"
                aria-label="Filter by featured"
                options={FEATURED_OPTIONS}
                placeholder="Featured or not"
                value={list.filters.featured ?? ''}
                onChange={(event) => list.setFilter('featured', event.target.value || undefined)}
              />
            </>
          }
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() =>
                deleteTestimonials(
                  selectedIds,
                  `${selectedIds.length} ${selectedIds.length === 1 ? 'testimonial' : 'testimonials'}`,
                )
              }
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
          rows={testimonials}
          columns={columns}
          getRowId={(item) => item.id}
          caption="Testimonials with their rating and status"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(item) => navigate(`/testimonials/${item.id}/edit`)}
          emptyIcon={MessageSquareQuote}
          emptyTitle={narrowed ? 'No matching testimonials' : 'No testimonials yet'}
          emptyDescription={
            narrowed
              ? 'Try a different search term or clear the filters.'
              : 'Add what graduates, parents and partners say about XAI Robotics. Published ones appear on the website.'
          }
          rowActions={(item) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${item.name}`}>
                  <MoreHorizontal size={16} />
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onSelect={() => navigate(`/testimonials/${item.id}/edit`)}>
                Edit
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={Trash2}
                tone="danger"
                onSelect={() => deleteTestimonials([item.id], 'this testimonial', item.quote)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          )}
        />
      </Card>
    </div>
  )
}
