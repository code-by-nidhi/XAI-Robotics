import { Trophy } from 'lucide-react'

import { ContentStatusBadge } from '../../components/common/Badge'
import type { Column } from '../../components/data/DataTable'
import { Select } from '../../components/form/Select'
import {
  CASE_STUDY_CATEGORIES,
  categoryName,
  categoryOptions,
  SERVICE_OPTIONS,
} from '../../config/taxonomy'
import type { CaseStudy } from '../../types'
import { ContentList } from '../shared/ContentList'
import { CoverThumb, PublishedCell } from '../shared/listCells'
import { caseStudyHooks } from './useCaseStudies'

const COLUMNS: Column<CaseStudy>[] = [
  {
    id: 'title',
    header: 'Case study',
    primary: true,
    sortable: true,
    cell: (study) => (
      <div className="flex items-center gap-3">
        <CoverThumb image={study.coverImage} />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{study.title}</p>
          <p className="truncate text-xs text-slate-400">{study.client || 'No institution yet'}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'industry',
    header: 'Industry',
    sortable: true,
    hideBelow: 'lg',
    cell: (study) => study.industry || <span className="text-slate-400">—</span>,
  },
  {
    id: 'category',
    header: 'Category',
    hideBelow: 'xl',
    cell: (study) =>
      categoryName(CASE_STUDY_CATEGORIES, study.category) ?? (
        <span className="text-slate-400">Uncategorised</span>
      ),
  },
  {
    id: 'views',
    header: 'Views',
    sortable: true,
    align: 'right',
    hideBelow: 'xl',
    cell: (study) => <span className="tabular-nums text-slate-500">{study.views ?? 0}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    cell: (study) => <ContentStatusBadge status={study.status} />,
  },
  {
    id: 'publishedAt',
    header: 'Published',
    sortable: true,
    hideBelow: 'lg',
    cell: (study) => <PublishedCell record={study} />,
  },
]

const CATEGORY_OPTIONS = categoryOptions(CASE_STUDY_CATEGORIES)

export default function CaseStudiesListPage() {
  return (
    <ContentList
      title="Case Studies"
      nouns={['case study', 'case studies']}
      segment="case-studies"
      siteModule="case-studies"
      hooks={caseStudyHooks}
      columns={COLUMNS}
      labelOf={(study) => study.title}
      extraFilterKeys={['category', 'serviceSlug']}
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
          <div className="w-52">
            <Select
              aria-label="Filter by programme"
              value={list.filters.serviceSlug ?? ''}
              onChange={(event) => list.setFilter('serviceSlug', event.target.value || undefined)}
              options={SERVICE_OPTIONS}
              placeholder="Any service"
            />
          </div>
        </>
      )}
      searchPlaceholder="Search by title, institution or sector"
      emptyIcon={Trophy}
      emptyDescription="Tell the story of a school, college or partner that built robotics with XAI."
      addLabel="Add Case Study"
    />
  )
}
