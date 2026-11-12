import { query, queryOne, type Row } from '../../db/pool.js'
import {
  contentRepo,
  nullable,
  publicBySlug,
  publicMedia,
  publicSeo,
  text,
} from '../shared/contentRepo.js'
import { mediaOf, resultsOf, seoOf, stringsOf, type FieldMap } from '../shared/fields.js'
import { liveSql, publishedAtSql } from '../shared/publishing.js'
import { categorySlug, PORTFOLIO_CATEGORIES, publicCategory } from '../shared/taxonomy.js'
import type { PortfolioInput, PortfolioPatch } from './portfolio.schema.js'

const FIELDS: FieldMap = {
  title: { column: 'title', kind: 'text' },
  slug: { column: 'slug', kind: 'text' },
  client: { column: 'client', kind: 'optional' },
  industry: { column: 'industry', kind: 'optional' },
  summary: { column: 'summary', kind: 'text' },
  description: { column: 'description', kind: 'html' },
  category: { column: 'category', kind: 'optional' },
  caseStudyId: { column: 'case_study_id', kind: 'optional' },
  technologies: { column: 'technologies', kind: 'json' },
  team: { column: 'team', kind: 'json' },
  results: { column: 'results', kind: 'json' },
  projectUrl: { column: 'project_url', kind: 'optional' },
  githubUrl: { column: 'github_url', kind: 'optional' },
  duration: { column: 'duration', kind: 'optional' },
  icon: { column: 'icon', kind: 'optional' },
  coverImage: { column: 'cover_image_id', kind: 'media' },
  featured: { column: 'featured', kind: 'bool' },
  state: { column: 'state', kind: 'text' },
  sortOrder: { column: 'sort_order', kind: 'number' },
}

function toAdmin(row: Row): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    client: row.client ?? undefined,
    industry: row.industry ?? undefined,
    summary: row.summary,
    description: text(row.description),
    category: row.category ?? undefined,
    caseStudyId: row.case_study_id ?? undefined,
    caseStudy: row.case_study_id ? { id: row.case_study_id, title: row.case_title, slug: row.case_slug } : undefined,
    technologies: stringsOf(row.technologies),
    team: stringsOf(row.team),
    results: resultsOf(row.results),
    projectUrl: row.project_url ?? undefined,
    githubUrl: row.github_url ?? undefined,
    duration: row.duration ?? undefined,
    icon: row.icon ?? undefined,
    coverImage: mediaOf(row, 'cover_image_id', 'cover'),
    featured: Boolean(row.featured),
    state: row.state,
    sortOrder: Number(row.sort_order ?? 0),
    status: row.status,
    publishAt: row.publish_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    seo: seoOf(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function publishProblems(p: Record<string, unknown>): Record<string, string> {
  const problems: Record<string, string> = {}
  if (!text(p.title).trim()) problems.title = 'Add a title.'
  if (text(p.summary).trim().length < 20) {
    problems.summary = 'Add a summary of at least 20 characters before publishing.'
  }
  if (!p.category) problems.category = "Choose a category; the website's portfolio is filtered by it."
  return problems
}

const repo = contentRepo<PortfolioInput, PortfolioPatch>({
  table: 'portfolio',
  alias: 'p',
  label: 'Portfolio item',
  fields: FIELDS,
  seo: true,
  media: [
    { column: 'cover_image_id', as: 'cover' },
    { column: 'og_image_id', as: 'og' },
  ],
  // The linked case study's own status decides whether the site may link it.
  extraSelect: `cs.title AS case_title, cs.slug AS case_slug, ${liveSql('cs')} AS case_live`,
  extraJoins: 'LEFT JOIN case_studies cs ON cs.id = p.case_study_id',
  sortable: {
    title: 'p.title',
    status: 'p.status',
    state: 'p.state',
    featured: 'p.featured',
    sortOrder: 'p.sort_order',
    publishedAt: 'p.published_at',
    createdAt: 'p.created_at',
    updatedAt: 'p.updated_at',
  },
  filterable: {
    status: 'p.status',
    state: 'p.state',
    featured: 'p.featured',
    category: 'p.category',
    caseStudyId: 'p.case_study_id',
    createdAt: 'p.created_at',
    updatedAt: 'p.updated_at',
  },
  searchColumns: ['p.title', 'p.slug', 'p.client', 'p.industry', 'p.summary'],
  fallbackSort: { column: 'p.sort_order', dir: 'asc' },
  toAdmin,
  redirectType: 'portfolio',
  publishProblems,
})

export const { list, get, create, update, remove } = repo

/* ------------------------------------------------------------------ */
/* Public                                                               */
/* ------------------------------------------------------------------ */

/** Published (or due) and still shown. */
const LIVE = `${liveSql('p')} AND p.state = 'active'`
const PUBLIC_SELECT = `${repo.select}, ${publishedAtSql('p')} AS public_at`

function toPublic(row: Row, withDetail: boolean) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    client: nullable(row.client),
    industry: nullable(row.industry),
    category: publicCategory(PORTFOLIO_CATEGORIES, row.category),
    summary: text(row.summary),
    cover: publicMedia(row, 'cover_image_id', 'cover'),
    icon: nullable(row.icon),
    featured: Boolean(row.featured),
    technologies: stringsOf(row.technologies),
    // Only a case study that is itself public: a link to a draft is a 404.
    caseStudy: row.case_study_id && Number(row.case_live) === 1 ? (row.case_slug as string) : null,
    publishedAt: row.public_at as string,
    ...(withDetail
      ? {
          descriptionHtml: text(row.description),
          results: resultsOf(row.results),
          team: stringsOf(row.team),
          duration: nullable(row.duration),
          projectUrl: nullable(row.project_url),
          githubUrl: nullable(row.github_url),
          seo: publicSeo(row),
        }
      : {}),
  }
}

export async function publicList(opts: {
  page: number
  pageSize: number
  category?: string
  featured?: boolean
}): Promise<{ items: unknown[]; total: number; categories: { name: string; slug: string }[] }> {
  const clauses = [LIVE]
  const params: unknown[] = []
  if (opts.category) {
    clauses.push('p.category = ?')
    params.push(categorySlug(PORTFOLIO_CATEGORIES, opts.category))
  }
  if (opts.featured) clauses.push('p.featured = 1')
  const where = `WHERE ${clauses.join(' AND ')}`

  const [total, rows, used] = await Promise.all([
    queryOne<{ n: number }>(`SELECT COUNT(*) AS n ${repo.from} ${where}`, params),
    query<Row>(
      `SELECT ${PUBLIC_SELECT} ${repo.from} ${where}
        ORDER BY p.sort_order ASC, public_at DESC LIMIT ? OFFSET ?`,
      [...params, opts.pageSize, (opts.page - 1) * opts.pageSize],
    ),
    // The filter tabs: categories that have at least one visible item, in the list's order.
    query<Row>(`SELECT DISTINCT p.category ${repo.from} WHERE ${LIVE} AND p.category IS NOT NULL`),
  ])
  const inUse = new Set(used.map((row) => row.category as string))
  const categories = PORTFOLIO_CATEGORIES.filter((c) => inUse.has(c.slug))

  return {
    items: rows.map((row) => toPublic(row, false)),
    total: Number(total?.n ?? 0),
    categories: categories.map((c) => ({ name: c.name, slug: c.slug })),
  }
}

export function publicGet(slug: string) {
  return publicBySlug({
    select: PUBLIC_SELECT,
    from: repo.from,
    alias: 'p',
    where: LIVE,
    redirectType: 'portfolio',
    slug,
    map: (row) => toPublic(row, true),
  })
}
