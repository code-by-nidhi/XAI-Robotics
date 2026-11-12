import { randomUUID } from 'node:crypto'

import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { notFound, unprocessable } from '../../http/errors.js'
import type { ListParams, ListResult } from '../../http/listParams.js'
import type { ContentStatus } from './content.schema.js'
import { columnsFor, mediaJoins, SEO_FIELDS, type FieldMap } from './fields.js'
import { listRows, placeholders } from './list.js'
import {
  assertPublishable,
  goesLive,
  publishingColumns,
  recordSlugChange,
  releaseSlug,
  wasPublic,
  type RedirectType,
} from './publishing.js'
import { insertRow, record, updateRow } from './write.js'

/** What every content input carries, whatever else it has. */
export interface ContentInput {
  slug?: string
  status?: ContentStatus
  publishAt?: string | null
  seo?: Record<string, unknown>
}

export interface ContentSpec {
  table: string
  alias: string
  /** For "<label> not found." */
  label: string
  fields: FieldMap
  /** Whether the type has the shared SEO block. */
  seo: boolean
  media: { column: string; as: string }[]
  extraSelect?: string
  extraJoins?: string
  sortable: Record<string, string>
  filterable: Record<string, string>
  searchColumns: string[]
  fallbackSort: { column: string; dir: 'asc' | 'desc' }
  /** The form-facing shape. Also used to merge a patch over what is stored. */
  toAdmin(row: Row): Record<string, unknown>
  /** Old-slug redirects, for types with a public page of their own. */
  redirectType?: RedirectType
  /** Missing fields, keyed for the form, before the item may be public. */
  publishProblems(merged: Record<string, unknown>): Record<string, string>
}

/**
 * List / get / create / update / remove for a content table.
 *
 * The five new Zaavi types share every rule — unique slug, publish checks on
 * the merged record, status columns, old-slug redirects — and differ only in
 * their fields. Declaring the differences and deriving the rest keeps those
 * rules identical across types, which is what the website relies on.
 */
export function contentRepo<C extends ContentInput, P extends ContentInput>(spec: ContentSpec) {
  const { table, alias } = spec
  const media = mediaJoins(alias, spec.media)
  const select = [`${alias}.*`, media.select, spec.extraSelect].filter(Boolean).join(', ')
  const from = `FROM ${table} ${alias} ${media.joins} ${spec.extraJoins ?? ''}`

  async function loadRow(id: string): Promise<Row | undefined> {
    return queryOne<Row>(`SELECT ${select} ${from} WHERE ${alias}.id = ? LIMIT 1`, [id])
  }

  async function list(params: ListParams): Promise<ListResult<unknown>> {
    const { rows, total } = await listRows(params, {
      from,
      select,
      sortable: spec.sortable,
      filterable: spec.filterable,
      searchColumns: spec.searchColumns,
      fallbackSort: spec.fallbackSort,
    })
    return { items: rows.map(spec.toAdmin), total, page: params.page, pageSize: params.pageSize }
  }

  async function get(id: string): Promise<unknown> {
    const row = await loadRow(id)
    if (!row) throw notFound(spec.label)
    return spec.toAdmin(row)
  }

  /** The slug is the public URL, so a clash would make one item unreachable. */
  async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
    const clash = await queryOne<Row>(
      `SELECT id FROM ${table} WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
      exceptId ? [slug, exceptId] : [slug],
    )
    if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
  }

  function valuesFor(input: ContentInput): Record<string, unknown> {
    return record(
      columnsFor(spec.fields, input as Record<string, unknown>),
      spec.seo ? columnsFor(SEO_FIELDS, input.seo ?? {}) : { columns: [], values: [] },
    )
  }

  async function create(input: C): Promise<unknown> {
    if (input.slug) await assertSlugFree(input.slug)
    if (goesLive(input.status ?? 'draft')) {
      assertPublishable(spec.publishProblems(input as Record<string, unknown>))
    }

    const values = valuesFor(input)
    Object.assign(values, publishingColumns(input))

    const id = randomUUID()
    await transaction((connection) => insertRow(connection, table, id, values))
    if (spec.redirectType && input.slug) await releaseSlug(spec.redirectType, input.slug)
    return get(id)
  }

  async function update(id: string, patch: P): Promise<unknown> {
    const existing = await loadRow(id)
    if (!existing) throw notFound(spec.label)
    if (patch.slug !== undefined) await assertSlugFree(patch.slug, id)

    const current = {
      status: existing.status as ContentStatus,
      publish_at: (existing.publish_at as string | null) ?? null,
      published_at: (existing.published_at as string | null) ?? null,
    }

    // Checked against the record as it will be after the save, not the patch
    // alone: a title-only edit to a live item must still leave it complete.
    if (goesLive(patch.status ?? current.status)) {
      const stored = spec.toAdmin(existing)
      const merged: Record<string, unknown> = { ...stored }
      for (const [key, value] of Object.entries(patch)) if (value !== undefined) merged[key] = value
      assertPublishable(spec.publishProblems(merged))
    }

    const values = valuesFor(patch)
    Object.assign(values, publishingColumns(patch, current))
    await transaction((connection) => updateRow(connection, table, id, values))

    if (spec.redirectType && patch.slug !== undefined) {
      await recordSlugChange(spec.redirectType, id, existing.slug as string, patch.slug, wasPublic(current))
    }
    return get(id)
  }

  async function remove(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    await query(`DELETE FROM ${table} WHERE id IN (${placeholders(ids)})`, ids)
    if (spec.redirectType) {
      await query(`DELETE FROM slug_redirects WHERE type = ? AND target_id IN (${placeholders(ids)})`, [
        spec.redirectType,
        ...ids,
      ])
    }
  }

  return { list, get, create, update, remove, select, from }
}

/** Public SEO block: raw values, null when unset — the website owns fallbacks. */
export function publicSeo(row: Row) {
  return {
    title: (row.meta_title as string | null) ?? null,
    description: (row.meta_description as string | null) ?? null,
    canonical: (row.canonical_url as string | null) ?? null,
    noIndex: Boolean(row.no_index),
    ogTitle: (row.og_title as string | null) ?? null,
    ogDescription: (row.og_description as string | null) ?? null,
    ogImage: (row.og_url as string | null) ?? null,
  }
}

/** Public image: url and alt, plus its size when known. */
export function publicMedia(row: Row, column: string, as: string) {
  if (!row[column]) return null
  return {
    url: String(row[`${as}_url`] ?? ''),
    alt: String(row[`${as}_alt`] ?? ''),
    width: row[`${as}_width`] == null ? null : Number(row[`${as}_width`]),
    height: row[`${as}_height`] == null ? null : Number(row[`${as}_height`]),
  }
}

/** Empty strings from a NULL column, for public text fields. */
export const text = (value: unknown): string => (value == null ? '' : String(value))
export const nullable = (value: unknown): string | null => (value == null || value === '' ? null : String(value))

/**
 * One public item by slug, or where an old slug now points.
 *
 * `where` is the type's own visibility rule (portfolio also needs state =
 * active, jobs an open closing date), applied to the redirect target too: an
 * old slug must not become a way to reach an item that is no longer public.
 */
export async function publicBySlug<T>(opts: {
  select: string
  from: string
  alias: string
  where: string
  redirectType: RedirectType
  slug: string
  map: (row: Row) => T | Promise<T>
}): Promise<{ item: T } | { redirect: string } | null> {
  const { select, from, alias, where, slug } = opts
  const row = await queryOne<Row>(
    `SELECT ${select} ${from} WHERE ${alias}.slug = ? AND ${where} LIMIT 1`,
    [slug],
  )
  if (row) return { item: await opts.map(row) }

  const target = await queryOne<Row>(
    'SELECT target_id FROM slug_redirects WHERE type = ? AND from_slug = ? LIMIT 1',
    [opts.redirectType, slug],
  )
  if (!target) return null
  const current = await queryOne<Row>(
    `SELECT ${alias}.slug ${from} WHERE ${alias}.id = ? AND ${where} LIMIT 1`,
    [target.target_id],
  )
  return current ? { redirect: current.slug as string } : null
}
