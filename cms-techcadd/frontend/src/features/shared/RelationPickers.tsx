import { useQuery } from '@tanstack/react-query'

import { caseStudiesApi, usersApi } from '../../api'
import { Select } from '../../components/form/Select'
import { categoryOptions, SERVICE_OPTIONS, type CategoryList } from '../../config/taxonomy'

/*
  Pickers for the records one content type points at.

  Categories and services come from the fixed lists in config/taxonomy.ts.
  The others load their whole (small) collection once and are cached under the
  same key the module's own list uses, so saving a case study elsewhere
  refreshes every open picker. A stored value that is no longer in the list — a
  dropped category, a deleted case study — is kept as an option rather than
  silently blanked, so opening and saving a form never drops a link nobody
  touched.
*/

const ALL = { page: 1, pageSize: 200 } as const

function withCurrent(options: { value: string; label: string }[], current?: string) {
  if (!current || options.some((option) => option.value === current)) return options
  return [...options, { value: current, label: `${current} (not found)` }]
}

interface PickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * A category from one of the fixed lists in config/taxonomy.ts — the list
 * decides which content type it is for, so a blog cannot be filed under a
 * portfolio heading.
 */
export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'Uncategorised',
}: PickerProps & { categories: CategoryList }) {
  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      options={withCurrent(categoryOptions(categories), value)}
      placeholder={placeholder}
    />
  )
}

/** Services are referenced by slug, because the slug is the service page's URL. */
export function ServiceSelect({ value, onChange, placeholder = 'None' }: PickerProps) {
  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      options={withCurrent(SERVICE_OPTIONS, value)}
      placeholder={placeholder}
    />
  )
}

export function CaseStudySelect({ value, onChange, placeholder = 'None' }: PickerProps) {
  const query = useQuery({
    queryKey: ['case-studies', 'list', { ...ALL, picker: true }],
    queryFn: () => caseStudiesApi.list({ ...ALL, sort: { field: 'title', dir: 'asc' } }),
  })
  const options = (query.data?.items ?? []).map((study) => ({
    value: study.id,
    label: study.status === 'published' ? study.title : `${study.title} (${study.status})`,
  }))

  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      options={withCurrent(options, value)}
      placeholder={query.isLoading ? 'Loading…' : placeholder}
    />
  )
}

/**
 * The byline. Every account is offered — the website prints the person's name
 * and job title, so it is the Team page, not this list, that decides who
 * appears as an author.
 */
export function AuthorSelect({ value, onChange, placeholder = 'Whoever creates it' }: PickerProps) {
  const query = useQuery({
    queryKey: ['users', 'list', { ...ALL, picker: true }],
    queryFn: () => usersApi.list({ ...ALL, sort: { field: 'name', dir: 'asc' } }),
  })
  const options = (query.data?.items ?? []).map((user) => ({
    value: user.id,
    label: user.title ? `${user.name} — ${user.title}` : user.name,
  }))

  return (
    <Select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      options={withCurrent(options, value)}
      placeholder={query.isLoading ? 'Loading…' : placeholder}
    />
  )
}
