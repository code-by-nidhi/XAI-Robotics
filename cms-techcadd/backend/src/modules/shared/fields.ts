import type { Row } from '../../db/pool.js'
import { sanitizeRichText } from './sanitize.js'

/**
 * How a form field becomes a column, declared once per module.
 *
 * Every content repository used to spell out its INSERT column list, its
 * values array in the same order, and its UPDATE mapping — three lists that had
 * to agree, and the bug when they did not was a value silently landing in the
 * wrong column. One map per module, read by both writes, removes the chance.
 *
 * The kind decides the conversion:
 *   text      written as sent (NOT NULL columns, where '' is a real value)
 *   optional  '' and null become NULL — "absent means leave alone, empty means clear"
 *   html      sanitised, then written; '' stays ''
 *   json      a list or object, stringified
 *   bool      1 / 0
 *   number    as a number
 *   media     an image slot: its id, or NULL when sent as null
 */
export type FieldKind = 'text' | 'optional' | 'html' | 'json' | 'bool' | 'number' | 'media'

export interface Field {
  column: string
  kind: FieldKind
}

export type FieldMap = Record<string, Field>

function convert(kind: FieldKind, value: unknown): unknown {
  switch (kind) {
    case 'optional':
      return value === '' || value === null || value === undefined ? null : value
    case 'html':
      return sanitizeRichText(typeof value === 'string' ? value : '')
    case 'json':
      return JSON.stringify(value ?? [])
    case 'bool':
      return value ? 1 : 0
    case 'number':
      return Number(value ?? 0)
    case 'media':
      return (value as { id?: unknown } | null | undefined)?.id ?? null
    default:
      return value
  }
}

/**
 * Columns and values for the keys present in `input`.
 *
 * Absent keys are skipped, which is what makes the same call serve a create
 * (the schema's defaults fill every key) and a partial update (only what was
 * sent is written).
 */
export function columnsFor(
  fields: FieldMap,
  input: Record<string, unknown>,
): { columns: string[]; values: unknown[] } {
  const columns: string[] = []
  const values: unknown[] = []
  for (const [key, field] of Object.entries(fields)) {
    if (input[key] === undefined) continue
    columns.push(field.column)
    values.push(convert(field.kind, input[key]))
  }
  return { columns, values }
}

/** The SEO block, which every page-backed type stores in the same columns. */
export const SEO_FIELDS: FieldMap = {
  metaTitle: { column: 'meta_title', kind: 'optional' },
  metaDescription: { column: 'meta_description', kind: 'optional' },
  canonicalUrl: { column: 'canonical_url', kind: 'optional' },
  ogTitle: { column: 'og_title', kind: 'optional' },
  ogDescription: { column: 'og_description', kind: 'optional' },
  ogImage: { column: 'og_image_id', kind: 'media' },
  noIndex: { column: 'no_index', kind: 'bool' },
}

/**
 * JSON as stored.
 *
 * MySQL hands JSON columns back parsed; MariaDB stores JSON as LONGTEXT and
 * hands back the string. Both are in use here, so every read goes through this.
 */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'string') return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function stringsOf(value: unknown): string[] {
  const parsed = parseJson<unknown>(value, [])
  return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
}

export function resultsOf(value: unknown): { value: string; label: string }[] {
  const parsed = parseJson<unknown>(value, [])
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((entry) => {
      const item = (entry ?? {}) as { value?: unknown; label?: unknown }
      return { value: String(item.value ?? ''), label: String(item.label ?? '') }
    })
    .filter((item) => item.value || item.label)
}

/**
 * SELECT and JOIN fragments for image slots.
 *
 * Each slot is joined under its own alias and its url/alt/size come back as
 * `<as>_url` etc., which `mediaOf` reads. Declared per module so the two always
 * agree on the alias.
 */
export function mediaJoins(
  alias: string,
  slots: { column: string; as: string }[],
): { select: string; joins: string } {
  return {
    select: slots
      .map(
        ({ as }) =>
          `${as}.url AS ${as}_url, ${as}.alt AS ${as}_alt, ${as}.width AS ${as}_width, ${as}.height AS ${as}_height`,
      )
      .join(', '),
    joins: slots
      .map(({ column, as }) => `LEFT JOIN media ${as} ON ${as}.id = ${alias}.${column}`)
      .join(' '),
  }
}

export interface MediaOut {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
}

/** An image slot as the CMS forms read it; undefined when empty. */
export function mediaOf(row: Row, column: string, as: string): MediaOut | undefined {
  const id = row[column]
  if (!id) return undefined
  return {
    id: String(id),
    url: String(row[`${as}_url`] ?? ''),
    alt: String(row[`${as}_alt`] ?? ''),
    // The website lays an image out at its own proportions, so it needs them.
    width: row[`${as}_width`] == null ? undefined : Number(row[`${as}_width`]),
    height: row[`${as}_height`] == null ? undefined : Number(row[`${as}_height`]),
  }
}

/** The SEO block as the CMS forms read it. */
export function seoOf(row: Row) {
  return {
    metaTitle: (row.meta_title as string | null) ?? undefined,
    metaDescription: (row.meta_description as string | null) ?? undefined,
    canonicalUrl: (row.canonical_url as string | null) ?? undefined,
    ogTitle: (row.og_title as string | null) ?? undefined,
    ogDescription: (row.og_description as string | null) ?? undefined,
    ogImage: mediaOf(row, 'og_image_id', 'og'),
    noIndex: Boolean(row.no_index),
  }
}
