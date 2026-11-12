import { randomUUID } from 'node:crypto'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { notFound, unprocessable } from '../../http/errors.js'
import type { ListParams, ListResult } from '../../http/listParams.js'
import { columnsFor, mediaJoins, mediaOf, parseJson, SEO_FIELDS, seoOf, type FieldMap } from '../shared/fields.js'
import { listRows, placeholders } from '../shared/list.js'
import {
  assertPublishable,
  goesLive,
  liveSql,
  publishedAtSql,
  publishingColumns,
  recordSlugChange,
  redirectTarget,
  releaseSlug,
  wasPublic,
} from '../shared/publishing.js'
import { readingMinutes, sanitizeRichText, textOf } from '../shared/sanitize.js'
import { BLOG_CATEGORIES, categorySlug, publicCategory } from '../shared/taxonomy.js'
import { insertRow, record, updateRow } from '../shared/write.js'
import type { BlogInput, BlogPatch } from './blogs.schema.js'

const SORTABLE: Record<string, string> = {
  title: 'b.title',
  slug: 'b.slug',
  status: 'b.status',
  views: 'b.views',
  publishAt: 'b.publish_at',
  publishedAt: 'b.published_at',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'b.status',
  category: 'b.category',
  relatedService: 'b.related_service',
  authorId: 'b.author_id',
  publishedAt: 'b.published_at',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

const FIELDS: FieldMap = {
  title: { column: 'title', kind: 'text' },
  slug: { column: 'slug', kind: 'text' },
  authorId: { column: 'author_id', kind: 'optional' },
  category: { column: 'category', kind: 'optional' },
  relatedService: { column: 'related_service', kind: 'optional' },
  coverImage: { column: 'cover_image_id', kind: 'media' },
  excerpt: { column: 'excerpt', kind: 'text' },
  body: { column: 'body', kind: 'html' },
}

const SEO: FieldMap = { ...SEO_FIELDS, keywords: { column: 'meta_keywords', kind: 'json' } }

const media = mediaJoins('b', [
  { column: 'cover_image_id', as: 'cover' },
  { column: 'og_image_id', as: 'og' },
])

const SELECT = `b.*, ${media.select},
  au.name AS author_name, au.title AS author_title, av.url AS author_avatar_url`

const FROM = `FROM blogs b ${media.joins}
  LEFT JOIN users au ON au.id = b.author_id
  LEFT JOIN media av ON av.id = au.avatar_id`

function toBlog(row: Row, tags: string[]): unknown {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    authorId: row.author_id ?? undefined,
    author: row.author_id
      ? { id: row.author_id, name: row.author_name, title: row.author_title ?? undefined }
      : undefined,
    category: row.category ?? undefined,
    relatedService: row.related_service ?? undefined,
    tags,
    coverImage: mediaOf(row, 'cover_image_id', 'cover'),
    excerpt: row.excerpt,
    body: row.body,
    readMinutes: Number(row.read_minutes ?? 1),
    views: Number(row.views ?? 0),
    status: row.status,
    publishAt: row.publish_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    seo: { ...seoOf(row), keywords: parseJson<string[]>(row.meta_keywords, []) },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** One query for the whole page rather than one per post. */
async function loadTags(ids: string[]): Promise<Map<string, { name: string; slug: string }[]>> {
  const map = new Map<string, { name: string; slug: string }[]>()
  if (ids.length === 0) return map
  for (const id of ids) map.set(id, [])

  const rows = await query<Row>(
    `SELECT bt.blog_id, t.name, t.slug FROM blog_tags bt
       JOIN tags t ON t.id = bt.tag_id
      WHERE bt.blog_id IN (${placeholders(ids)}) ORDER BY bt.position`,
    ids,
  )
  for (const row of rows) {
    map.get(row.blog_id as string)?.push({ name: row.name as string, slug: row.slug as string })
  }
  return map
}

const tagNames = (tags: { name: string }[] | undefined) => (tags ?? []).map((t) => t.name)

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { rows, total } = await listRows(params, {
    from: FROM,
    select: SELECT,
    sortable: SORTABLE,
    filterable: FILTERABLE,
    // Tags live in a child table, so the search reaches into it — "react"
    // should find a post that only carries it as a tag.
    searchColumns: [
      'b.title', 'b.slug', 'b.excerpt',
      `(SELECT GROUP_CONCAT(t.name) FROM blog_tags bt JOIN tags t ON t.id = bt.tag_id WHERE bt.blog_id = b.id)`,
    ],
    fallbackSort: { column: 'b.updated_at', dir: 'desc' },
  })

  const tags = await loadTags(rows.map((row) => row.id as string))
  return {
    items: rows.map((row) => toBlog(row, tagNames(tags.get(row.id as string)))),
    total,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`SELECT ${SELECT} ${FROM} WHERE b.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Post')
  const tags = await loadTags([id])
  return toBlog(row, tagNames(tags.get(id)))
}

/** The slug is the public URL, so a clash would make one post unreachable. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM blogs WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

/** What a post needs before it can be public, as on the Zaavi CMS. */
function publishProblems(post: { title: string; excerpt: string; body: string }): Record<string, string> {
  const problems: Record<string, string> = {}
  if (!post.title.trim()) problems.title = 'Add a title.'
  if (post.excerpt.trim().length < 20) {
    problems.excerpt = 'Add an excerpt of at least 20 characters before publishing.'
  }
  if (textOf(post.body).length < 50 && !/<(img|iframe)/.test(post.body)) {
    problems.body = 'Write some content before publishing.'
  }
  return problems
}

async function writeTags(connection: PoolConnection, blogId: string, tags: string[]): Promise<void> {
  await connection.execute<ResultSetHeader>('DELETE FROM blog_tags WHERE blog_id = ?', [blogId])

  /**
   * Names in, rows out.
   *
   * The form sends what the editor typed, and a tag they have just invented is
   * indistinguishable from one that already exists — which is the point: they
   * should not have to know, and should not be made to create it separately
   * first. Matching is by slug, so "AI", "ai" and "A.I." all find one tag.
   */
  const seen = new Set<string>()
  let position = 0

  for (const raw of tags) {
    const name = raw.trim()
    if (!name) continue

    const slug = slugifyTag(name)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)

    // INSERT IGNORE then read: the unique key on the slug decides, so two
    // people adding the same new tag at the same moment still get one row.
    await connection.execute<ResultSetHeader>(
      'INSERT IGNORE INTO tags (id, name, slug, created_at) VALUES (?, ?, ?, NOW(3))',
      [randomUUID(), name, slug],
    )

    const [found] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM tags WHERE slug = ? LIMIT 1',
      [slug],
    )
    const tagId = found[0]?.id as string | undefined
    if (!tagId) continue

    await connection.execute<ResultSetHeader>(
      'INSERT INTO blog_tags (blog_id, tag_id, position) VALUES (?, ?, ?)',
      [blogId, tagId, position++],
    )
  }
}

/** Kept identical to the CMS's own, so a typed tag resolves to its existing row. */
function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * `signedInUserId` is the fallback author.
 *
 * The form has no author field by default, so without this every post would be
 * written by nobody. An explicit authorId still wins, which keeps imports possible.
 */
export async function create(input: BlogInput, signedInUserId: string): Promise<unknown> {
  await assertSlugFree(input.slug)
  if (goesLive(input.status)) assertPublishable(publishProblems(input))

  const body = sanitizeRichText(input.body)
  const values = record(
    columnsFor(FIELDS, { ...input, authorId: input.authorId || signedInUserId }),
    columnsFor(SEO, input.seo),
  )
  Object.assign(values, publishingColumns(input), { read_minutes: readingMinutes(body) })

  const id = randomUUID()
  await transaction(async (connection) => {
    await insertRow(connection, 'blogs', id, values)
    await writeTags(connection, id, input.tags)
  })
  await releaseSlug('blog', input.slug)

  return get(id)
}

export async function update(id: string, patch: BlogPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT * FROM blogs WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Post')
  if (patch.slug !== undefined) await assertSlugFree(patch.slug, id)

  const current = {
    status: existing.status as BlogInput['status'],
    publish_at: existing.publish_at as string | null,
    published_at: existing.published_at as string | null,
  }
  const status = patch.status ?? current.status
  if (goesLive(status)) {
    assertPublishable(
      publishProblems({
        title: patch.title ?? (existing.title as string),
        excerpt: patch.excerpt ?? (existing.excerpt as string),
        body: patch.body ?? (existing.body as string),
      }),
    )
  }

  const values = record(columnsFor(FIELDS, patch), columnsFor(SEO, patch.seo ?? {}))
  Object.assign(values, publishingColumns(patch, current))
  if (patch.body !== undefined) values.read_minutes = readingMinutes(values.body as string)

  await transaction(async (connection) => {
    await updateRow(connection, 'blogs', id, values)
    if (patch.tags !== undefined) await writeTags(connection, id, patch.tags)
  })

  // A post that has been public keeps its old URL working.
  if (patch.slug !== undefined) {
    await recordSlugChange('blog', id, existing.slug as string, patch.slug, wasPublic(current))
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // blog_tags cascades; redirects to a deleted post have nothing to land on.
  await query(`DELETE FROM blogs WHERE id IN (${placeholders(ids)})`, ids)
  await query(
    `DELETE FROM slug_redirects WHERE type = 'blog' AND target_id IN (${placeholders(ids)})`,
    ids,
  )
}

/* ------------------------------------------------------------------ */
/* Public                                                               */
/* ------------------------------------------------------------------ */

/**
 * A post as the website renders it.
 *
 * No internal ids beyond the post's own, no status, no author email, no audit
 * fields. SEO values are raw (null when unset) — the website owns the
 * fallbacks, so it can word them per page.
 */
function toPublic(row: Row, tags: { name: string; slug: string }[], withContent: boolean) {
  const cover = mediaOf(row, 'cover_image_id', 'cover')
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    category: publicCategory(BLOG_CATEGORIES, row.category),
    tags: tags.map((t) => t.name),
    tagSlugs: tags.map((t) => t.slug),
    readMinutes: Number(row.read_minutes ?? 1),
    cover: cover ? { url: cover.url, alt: cover.alt, width: cover.width ?? null, height: cover.height ?? null } : null,
    author: row.author_id
      ? {
          name: row.author_name as string,
          title: (row.author_title as string | null) ?? null,
          avatar: (row.author_avatar_url as string | null) ?? null,
        }
      : null,
    relatedService: (row.related_service as string | null) ?? null,
    publishedAt: row.public_at as string,
    updatedAt: row.updated_at as string,
    ...(withContent
      ? {
          html: row.body as string,
          seo: {
            title: (row.meta_title as string | null) ?? null,
            description: (row.meta_description as string | null) ?? null,
            canonical: (row.canonical_url as string | null) ?? null,
            noIndex: Boolean(row.no_index),
            ogTitle: (row.og_title as string | null) ?? null,
            ogDescription: (row.og_description as string | null) ?? null,
            ogImage: (row.og_url as string | null) ?? null,
          },
        }
      : {}),
  }
}

const PUBLIC_SELECT = `${SELECT}, ${publishedAtSql('b')} AS public_at`

export async function publicList(opts: {
  page: number
  pageSize: number
  category?: string
  tag?: string
}): Promise<{ items: unknown[]; total: number }> {
  const clauses = [liveSql('b')]
  const params: unknown[] = []
  if (opts.category) {
    clauses.push('b.category = ?')
    params.push(categorySlug(BLOG_CATEGORIES, opts.category))
  }
  if (opts.tag) {
    clauses.push(
      `EXISTS (SELECT 1 FROM blog_tags bt JOIN tags t ON t.id = bt.tag_id
                WHERE bt.blog_id = b.id AND (t.slug = ? OR t.name = ?))`,
    )
    params.push(opts.tag, opts.tag)
  }
  const where = `WHERE ${clauses.join(' AND ')}`

  const totalRow = await queryOne<{ total: number }>(`SELECT COUNT(*) AS total ${FROM} ${where}`, params)
  const rows = await query<Row>(
    `SELECT ${PUBLIC_SELECT} ${FROM} ${where} ORDER BY public_at DESC, b.id LIMIT ? OFFSET ?`,
    [...params, opts.pageSize, (opts.page - 1) * opts.pageSize],
  )
  const tags = await loadTags(rows.map((row) => row.id as string))
  return {
    items: rows.map((row) => toPublic(row, tags.get(row.id as string) ?? [], false)),
    total: Number(totalRow?.total ?? 0),
  }
}

/** One public post by slug; `{ redirect }` when the slug is an old one. */
export async function publicGet(slug: string): Promise<{ item: unknown } | { redirect: string } | null> {
  const row = await queryOne<Row>(
    `SELECT ${PUBLIC_SELECT} ${FROM} WHERE b.slug = ? AND ${liveSql('b')} LIMIT 1`,
    [slug],
  )
  if (row) {
    const tags = await loadTags([row.id as string])
    return { item: toPublic(row, tags.get(row.id as string) ?? [], true) }
  }
  const target = await redirectTarget('blog', slug)
  if (!target) return null
  const current = await queryOne<Row>(
    `SELECT b.slug FROM blogs b WHERE b.id = ? AND ${liveSql('b')} LIMIT 1`,
    [target],
  )
  return current ? { redirect: current.slug as string } : null
}
