import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import { mediaJoins, mediaOf } from '../shared/fields.js'
import type { TestimonialInput, TestimonialPatch } from './testimonials.schema.js'

const SORTABLE: Record<string, string> = {
  name: 't.name',
  company: 't.company',
  rating: 't.rating',
  order: 't.sort_order',
  status: 't.status',
  createdAt: 't.created_at',
  updatedAt: 't.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 't.status',
  featured: 't.featured',
  createdAt: 't.created_at',
  updatedAt: 't.updated_at',
}

const MEDIA = mediaJoins('t', [{ column: 'avatar_id', as: 'av' }])
const SELECT = `t.*, ${MEDIA.select}`
const FROM = `FROM testimonials t ${MEDIA.joins}`

/** '' and null both clear an optional text column. */
const orNull = (value: string | null | undefined): string | null =>
  value === undefined || value === null || value.trim() === '' ? null : value

function toTestimonial(row: Row): unknown {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    company: row.company ?? undefined,
    quote: row.quote,
    rating: row.rating == null ? null : Number(row.rating),
    avatar: mediaOf(row, 'avatar_id', 'av') ?? null,
    featured: Boolean(row.featured),
    order: Number(row.sort_order ?? 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  // Hand-set order first — the order the website shows them in.
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 't.sort_order', dir: 'asc' })

  const searchSql = params.search
    ? ' AND (t.name LIKE ? OR t.role LIKE ? OR t.company LIKE ? OR t.quote LIKE ?)'
    : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM testimonials t ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT ${SELECT} ${FROM} ${where}
      ORDER BY ${column} ${dir}, t.created_at DESC LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toTestimonial),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`SELECT ${SELECT} ${FROM} WHERE t.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Testimonial')
  return toTestimonial(row)
}

export async function create(input: TestimonialInput): Promise<unknown> {
  const id = randomUUID()
  await execute(
    `INSERT INTO testimonials
       (id, name, role, company, quote, rating, avatar_id, featured, sort_order, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
    [
      id,
      input.name,
      orNull(input.role),
      orNull(input.company),
      input.quote,
      input.rating ?? null,
      input.avatar?.id ?? null,
      input.featured ? 1 : 0,
      input.order,
      input.status,
    ],
  )
  return get(id)
}

export async function update(id: string, patch: TestimonialPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM testimonials WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Testimonial')

  const assignments: string[] = []
  const params: unknown[] = []
  const set = (column: string, value: unknown) => {
    assignments.push(`${column} = ?`)
    params.push(value)
  }

  if (patch.name !== undefined) set('name', patch.name)
  if (patch.quote !== undefined) set('quote', patch.quote)
  if (patch.status !== undefined) set('status', patch.status)
  if (patch.order !== undefined) set('sort_order', patch.order)
  // Absent leaves these alone; '' (text) or null clears them.
  if (patch.role !== undefined) set('role', orNull(patch.role))
  if (patch.company !== undefined) set('company', orNull(patch.company))
  if (patch.rating !== undefined) set('rating', patch.rating)
  if (patch.avatar !== undefined) set('avatar_id', patch.avatar?.id ?? null)
  // `false` is a value, not an absence, so a boolean needs its own branch.
  if (patch.featured !== undefined) set('featured', patch.featured ? 1 : 0)

  if (assignments.length > 0) {
    await execute(
      `UPDATE testimonials SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await query(`DELETE FROM testimonials WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}

/* ------------------------------------------------------------------ */
/* Public                                                               */
/* ------------------------------------------------------------------ */

export interface PublicTestimonial {
  id: string
  name: string
  role: string | null
  company: string | null
  quote: string
  rating: number | null
  avatar: { url: string; alt: string } | null
}

const blankToNull = (value: unknown): string | null =>
  value == null || value === '' ? null : String(value)

/**
 * Published testimonials for the website, in the order set in the CMS.
 *
 * `featured` narrows to the ones marked for the homepage. Exactly the fields
 * below — no status, no ownership, no media ids.
 */
export async function publicList(opts: { featured?: boolean }): Promise<PublicTestimonial[]> {
  const clauses = ["t.status = 'published'"]
  if (opts.featured) clauses.push('t.featured = 1')

  const rows = await query<Row>(
    `SELECT t.id, t.name, t.role, t.company, t.quote, t.rating, t.avatar_id, av.url AS av_url, av.alt AS av_alt
       FROM testimonials t LEFT JOIN media av ON av.id = t.avatar_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY t.sort_order ASC, t.created_at DESC`,
  )

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    role: blankToNull(row.role),
    company: blankToNull(row.company),
    quote: row.quote as string,
    rating: row.rating == null ? null : Number(row.rating),
    avatar:
      row.avatar_id && row.av_url
        ? { url: String(row.av_url), alt: String(row.av_alt ?? '') }
        : null,
  }))
}
