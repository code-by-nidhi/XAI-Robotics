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
import { textOf } from '../shared/sanitize.js'
import { CASE_STUDY_CATEGORIES, publicCategory } from '../shared/taxonomy.js'
import type { CaseStudyInput, CaseStudyPatch } from './case_studies.schema.js'

const FIELDS: FieldMap = {
  title: { column: 'title', kind: 'text' },
  slug: { column: 'slug', kind: 'text' },
  client: { column: 'client', kind: 'text' },
  industry: { column: 'industry', kind: 'text' },
  excerpt: { column: 'excerpt', kind: 'text' },
  overview: { column: 'overview', kind: 'html' },
  challenge: { column: 'challenge', kind: 'html' },
  approach: { column: 'approach', kind: 'html' },
  solution: { column: 'solution', kind: 'html' },
  implementation: { column: 'implementation', kind: 'html' },
  results: { column: 'results', kind: 'json' },
  technologies: { column: 'technologies', kind: 'json' },
  duration: { column: 'duration', kind: 'optional' },
  testimonialText: { column: 'testimonial_text', kind: 'optional' },
  testimonialName: { column: 'testimonial_name', kind: 'optional' },
  testimonialRole: { column: 'testimonial_role', kind: 'optional' },
  icon: { column: 'icon', kind: 'optional' },
  serviceSlug: { column: 'service_slug', kind: 'optional' },
  category: { column: 'category', kind: 'optional' },
  coverImage: { column: 'cover_image_id', kind: 'media' },
  sortOrder: { column: 'sort_order', kind: 'number' },
}

function toAdmin(row: Row): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    client: row.client,
    industry: row.industry,
    excerpt: row.excerpt,
    overview: text(row.overview),
    challenge: text(row.challenge),
    approach: text(row.approach),
    solution: text(row.solution),
    implementation: text(row.implementation),
    results: resultsOf(row.results),
    technologies: stringsOf(row.technologies),
    duration: row.duration ?? undefined,
    testimonialText: row.testimonial_text ?? undefined,
    testimonialName: row.testimonial_name ?? undefined,
    testimonialRole: row.testimonial_role ?? undefined,
    icon: row.icon ?? undefined,
    serviceSlug: row.service_slug ?? undefined,
    category: row.category ?? undefined,
    coverImage: mediaOf(row, 'cover_image_id', 'cover'),
    sortOrder: Number(row.sort_order ?? 0),
    views: Number(row.views ?? 0),
    status: row.status,
    publishAt: row.publish_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    seo: seoOf(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** A public case study tells a story about someone. */
function publishProblems(c: Record<string, unknown>): Record<string, string> {
  const problems: Record<string, string> = {}
  if (!text(c.title).trim()) problems.title = 'Add a title.'
  if (!text(c.client).trim()) {
    problems.client = 'Describe the client before publishing (it can stay anonymous).'
  }
  if (text(c.excerpt).trim().length < 20) {
    problems.excerpt = 'Add a summary of at least 20 characters before publishing.'
  }
  if (textOf(text(c.challenge) + text(c.solution) + text(c.overview)).length < 50) {
    problems.challenge = 'Describe the challenge and what was built before publishing.'
  }
  return problems
}

const repo = contentRepo<CaseStudyInput, CaseStudyPatch>({
  table: 'case_studies',
  alias: 'cs',
  label: 'Case study',
  fields: FIELDS,
  seo: true,
  media: [
    { column: 'cover_image_id', as: 'cover' },
    { column: 'og_image_id', as: 'og' },
  ],
  sortable: {
    title: 'cs.title',
    client: 'cs.client',
    industry: 'cs.industry',
    status: 'cs.status',
    sortOrder: 'cs.sort_order',
    views: 'cs.views',
    publishedAt: 'cs.published_at',
    createdAt: 'cs.created_at',
    updatedAt: 'cs.updated_at',
  },
  filterable: {
    status: 'cs.status',
    industry: 'cs.industry',
    category: 'cs.category',
    serviceSlug: 'cs.service_slug',
    createdAt: 'cs.created_at',
    updatedAt: 'cs.updated_at',
  },
  searchColumns: ['cs.title', 'cs.slug', 'cs.client', 'cs.industry', 'cs.excerpt'],
  fallbackSort: { column: 'cs.sort_order', dir: 'asc' },
  toAdmin,
  redirectType: 'case_study',
  publishProblems,
})

export const { list, get, create, update, remove } = repo

/* ------------------------------------------------------------------ */
/* Public                                                               */
/* ------------------------------------------------------------------ */

const LIVE = liveSql('cs')
const PUBLIC_SELECT = `${repo.select}, ${publishedAtSql('cs')} AS public_at`

function toPublic(row: Row, withContent: boolean) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    client: text(row.client),
    industry: text(row.industry),
    service: nullable(row.service_slug),
    icon: nullable(row.icon),
    excerpt: text(row.excerpt),
    cover: publicMedia(row, 'cover_image_id', 'cover'),
    duration: nullable(row.duration),
    results: resultsOf(row.results),
    technologies: stringsOf(row.technologies),
    category: publicCategory(CASE_STUDY_CATEGORIES, row.category),
    publishedAt: row.public_at as string,
    updatedAt: row.updated_at as string,
    ...(withContent
      ? {
          overviewHtml: text(row.overview),
          challengeHtml: text(row.challenge),
          approachHtml: text(row.approach),
          solutionHtml: text(row.solution),
          implementationHtml: text(row.implementation),
          testimonial: row.testimonial_text
            ? {
                text: row.testimonial_text as string,
                name: nullable(row.testimonial_name),
                role: nullable(row.testimonial_role),
              }
            : null,
          seo: publicSeo(row),
        }
      : {}),
  }
}

export async function publicList(opts: {
  page: number
  pageSize: number
  industry?: string
}): Promise<{ items: unknown[]; total: number }> {
  const where = `WHERE ${LIVE}${opts.industry ? ' AND cs.industry = ?' : ''}`
  const params = opts.industry ? [opts.industry] : []
  const total = await queryOne<{ n: number }>(`SELECT COUNT(*) AS n ${repo.from} ${where}`, params)
  const rows = await query<Row>(
    `SELECT ${PUBLIC_SELECT} ${repo.from} ${where}
      ORDER BY cs.sort_order ASC, public_at DESC LIMIT ? OFFSET ?`,
    [...params, opts.pageSize, (opts.page - 1) * opts.pageSize],
  )
  return { items: rows.map((row) => toPublic(row, false)), total: Number(total?.n ?? 0) }
}

export function publicGet(slug: string) {
  return publicBySlug({
    select: PUBLIC_SELECT,
    from: repo.from,
    alias: 'cs',
    where: LIVE,
    redirectType: 'case_study',
    slug,
    map: (row) => toPublic(row, true),
  })
}
