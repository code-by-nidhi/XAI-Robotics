import { LayoutGrid, Star } from 'lucide-react'

import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import type { Column } from '../../components/data/DataTable'
import { Select } from '../../components/form/Select'
import { categoryName, categoryOptions, PORTFOLIO_CATEGORIES } from '../../config/taxonomy'
import type { PortfolioItem } from '../../types'
import { ContentList } from '../shared/ContentList'
import { CoverThumb, PublishedCell } from '../shared/listCells'
import { portfolioHooks } from './usePortfolio'

const COLUMNS: Column<PortfolioItem>[] = [
  {
    id: 'title',
    header: 'Item',
    primary: true,
    sortable: true,
    cell: (item) => (
      <div className="flex items-center gap-3">
        <CoverThumb image={item.coverImage} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-medium text-slate-900">
            {item.title}
            {item.featured && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
          </p>
          <p className="truncate text-xs text-slate-400">{item.client || item.industry || '—'}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    hideBelow: 'lg',
    cell: (item) =>
      categoryName(PORTFOLIO_CATEGORIES, item.category) ?? <span className="text-slate-400">Uncategorised</span>,
  },
  {
    id: 'state',
    header: 'Shown',
    sortable: true,
    hideBelow: 'md',
    cell: (item) =>
      item.state === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Hidden</Badge>,
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    cell: (item) => <ContentStatusBadge status={item.status} />,
  },
  {
    id: 'publishedAt',
    header: 'Published',
    sortable: true,
    hideBelow: 'xl',
    cell: (item) => <PublishedCell record={item} />,
  },
]

const STATE_OPTIONS = [
  { value: 'active', label: 'Shown on site' },
  { value: 'inactive', label: 'Hidden' },
]

const CATEGORY_OPTIONS = categoryOptions(PORTFOLIO_CATEGORIES)

export default function PortfolioListPage() {
  return (
    <ContentList
      title="Portfolio"
      nouns={['portfolio item', 'portfolio items']}
      segment="portfolio"
      siteModule="portfolio"
      hooks={portfolioHooks}
      columns={COLUMNS}
      labelOf={(item) => item.title}
      extraFilterKeys={['state', 'category']}
      renderFilters={(list) => (
        <>
          <div className="w-52">
            <Select
              aria-label="Filter by category"
              value={list.filters.category ?? ''}
              onChange={(event) => list.setFilter('category', event.target.value || undefined)}
              options={CATEGORY_OPTIONS}
              placeholder="Any category"
            />
          </div>
          <div className="w-40">
            <Select
              aria-label="Filter by visibility"
              value={list.filters.state ?? ''}
              onChange={(event) => list.setFilter('state', event.target.value || undefined)}
              options={STATE_OPTIONS}
              placeholder="Any visibility"
            />
          </div>
        </>
      )}
      searchPlaceholder="Search by title, client or industry"
      emptyIcon={LayoutGrid}
      emptyDescription="Add the first robot build to the portfolio."
      addLabel="Add Portfolio Item"
    />
  )
}
