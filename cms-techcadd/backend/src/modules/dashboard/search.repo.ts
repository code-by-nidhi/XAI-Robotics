import { query, type Row } from '../../db/pool.js'

const PER_GROUP = 4

export interface SearchHit {
  id: string
  label: string
  detail?: string
}

/** Group keys are the CMS's own URL segments, so a hit links straight to its screen. */
export type SearchKey = 'blogs' | 'case-studies' | 'portfolio' | 'jobs' | 'enquiries'

export interface SearchGroup {
  key: SearchKey
  hits: SearchHit[]
}

/** label / detail / matched columns per group. Never from the request. */
const GROUPS: { key: SearchKey; sql: string; columns: number }[] = [
  {
    key: 'blogs',
    sql: 'SELECT id, title AS label, slug AS detail FROM blogs WHERE title LIKE ? OR slug LIKE ? ORDER BY updated_at DESC',
    columns: 2,
  },
  {
    key: 'case-studies',
    sql: `SELECT id, title AS label, client AS detail FROM case_studies
           WHERE title LIKE ? OR slug LIKE ? OR client LIKE ? ORDER BY updated_at DESC`,
    columns: 3,
  },
  {
    key: 'portfolio',
    sql: `SELECT id, title AS label, client AS detail FROM portfolio
           WHERE title LIKE ? OR slug LIKE ? OR client LIKE ? ORDER BY updated_at DESC`,
    columns: 3,
  },
  {
    key: 'jobs',
    sql: `SELECT id, title AS label, department AS detail FROM jobs
           WHERE title LIKE ? OR slug LIKE ? OR department LIKE ? ORDER BY updated_at DESC`,
    columns: 3,
  },
]

const ENQUIRIES = {
  key: 'enquiries' as const,
  sql: `SELECT id, name AS label, COALESCE(company, email) AS detail FROM enquiries
         WHERE name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ? ORDER BY created_at DESC`,
  columns: 4,
}

/**
 * Global search across the things people look for by name.
 *
 * LIKE with a leading wildcard cannot use an index, but FULLTEXT will not
 * match partial words — typing "rea" should find "React" while the user is
 * still typing, which is the entire point of the box. The per-group limit
 * keeps the scan bounded.
 *
 * Enquiries are searched only for a caller who has cleared the enquiries
 * password: a search box that returned lead names would be a way round it.
 */
export async function search(term: string, canSeeLeads: boolean): Promise<SearchGroup[]> {
  const like = `%${term}%`
  const groups = canSeeLeads ? [...GROUPS, ENQUIRIES] : GROUPS

  const results = await Promise.all(
    groups.map((group) =>
      query<Row>(`${group.sql} LIMIT ?`, [...Array<string>(group.columns).fill(like), PER_GROUP]),
    ),
  )

  return groups
    .map((group, index) => ({
      key: group.key,
      hits: (results[index] ?? []).map((row) => ({
        id: row.id as string,
        label: row.label as string,
        detail: (row.detail as string | null) ?? undefined,
      })),
    }))
    .filter((group) => group.hits.length > 0)
}
