import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { placeholders } from '../shared/list.js'
import { liveSql } from '../shared/publishing.js'
import { SERVICES } from '../shared/taxonomy.js'

/**
 * Website traffic from the page_views counters, alongside enquiries and
 * publishing — modelled on the Zaavi CMS's Analytics page. All days are UTC.
 */

export const RANGES = [7, 30, 90] as const
export type Range = (typeof RANGES)[number]

export function parseRange(value: unknown): Range {
  const n = Number(value)
  return (RANGES as readonly number[]).includes(n) ? (n as Range) : 30
}

const DAY = 86_400_000

function todayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/** [start, end) of the last `days` days including today, and the period before it. */
function periods(days: number) {
  const end = new Date(todayUtc().getTime() + DAY)
  const start = new Date(end.getTime() - days * DAY)
  return { start, end, prevStart: new Date(start.getTime() - days * DAY) }
}

/** Percentage change; null when there is nothing to compare against. */
const change = (current: number, previous: number) =>
  previous === 0 ? (current === 0 ? 0 : null) : Math.round(((current - previous) / previous) * 100)

const n = (value: unknown) => Number(value ?? 0)

/* ------------------------------------------------------------------ */
/* Recording                                                            */
/* ------------------------------------------------------------------ */

const PATH = /^\/[a-z0-9\-/]*$/
const CONTENT = [
  { prefix: '/blog/', type: 'blog', table: 'blogs' },
  { prefix: '/case-studies/', type: 'case_study', table: 'case_studies' },
] as const

/**
 * Counts one view of a page.
 *
 * Never throws: analytics must not affect the visitor. Only clean site paths
 * count — no query strings, no CMS or API paths — so the table cannot be
 * filled with junk keys. An article or case study view also adds to that
 * item's all-time total, but only while it is public: an old slug redirects,
 * so its beacon arrives from the new address.
 */
export async function recordPageView(rawPath: string): Promise<void> {
  try {
    const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath
    if (!PATH.test(path) || path.length > 200 || /^\/(admin|api|blog\/preview)(\/|$)/.test(path)) return

    let contentType: string | null = null
    let contentId: string | null = null
    const match = CONTENT.find((c) => path.startsWith(c.prefix) && !path.slice(c.prefix.length).includes('/'))
    if (match) {
      const slug = path.slice(match.prefix.length)
      const row = await queryOne<Row>(
        `SELECT t.id FROM ${match.table} t WHERE t.slug = ? AND ${liveSql('t')} LIMIT 1`,
        [slug],
      )
      if (!row) return
      contentType = match.type
      contentId = row.id as string
      await execute(`UPDATE ${match.table} SET views = views + 1 WHERE id = ?`, [contentId])
    }

    await execute(
      `INSERT INTO page_views (id, path, day, count, content_type, content_id)
       VALUES (?, ?, UTC_DATE(), 1, ?, ?)
       ON DUPLICATE KEY UPDATE count = count + 1`,
      [randomUUID(), path, contentType, contentId],
    )
  } catch (error) {
    console.error('[analytics] view not recorded:', error)
  }
}

/* ------------------------------------------------------------------ */
/* Reading                                                              */
/* ------------------------------------------------------------------ */

const STATIC_LABELS: Record<string, string> = {
  '/': 'Home',
  '/blog': 'Blog',
  '/case-studies': 'Case studies',
  '/portfolio': 'Portfolio',
  '/projects': 'Projects',
  '/careers': 'Careers',
  '/faq': 'FAQ',
  '/contact': 'Contact',
  '/about-us': 'About us',
  '/ai-solutions': 'AI solutions',
}

/** Readable names for paths: article and case study titles, service menu names, known pages, else the path. */
async function labelPaths(paths: string[]): Promise<(path: string) => string> {
  const slugs = (prefix: string) => paths.filter((p) => p.startsWith(prefix)).map((p) => p.slice(prefix.length))
  const titles = new Map<string, string>()
  for (const { prefix, table } of CONTENT) {
    const wanted = slugs(prefix)
    if (wanted.length === 0) continue
    const rows = await query<Row>(`SELECT slug, title FROM ${table} WHERE slug IN (${placeholders(wanted)})`, wanted)
    for (const row of rows) titles.set(`${prefix}${row.slug as string}`, row.title as string)
  }
  for (const service of SERVICES) titles.set(`/${service.slug}`, service.title)
  return (path) => titles.get(path) ?? STATIC_LABELS[path] ?? path
}

async function sumViews(start: Date, end: Date): Promise<number> {
  const row = await queryOne<Row>('SELECT SUM(count) AS n FROM page_views WHERE day >= ? AND day < ?', [
    isoDay(start),
    isoDay(end),
  ])
  return n(row?.n)
}

async function countEnquiries(start: Date, end: Date): Promise<number> {
  const row = await queryOne<Row>('SELECT COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND created_at < ?', [
    start,
    end,
  ])
  return n(row?.n)
}

async function publishedBetween(start: Date, end: Date) {
  const count = async (table: string) =>
    n(
      (
        await queryOne<Row>(`SELECT COUNT(*) AS n FROM ${table} WHERE published_at >= ? AND published_at < ?`, [
          start,
          end,
        ])
      )?.n,
    )
  const [blogs, caseStudies, portfolio] = await Promise.all([
    count('blogs'),
    count('case_studies'),
    count('portfolio'),
  ])
  return { total: blogs + caseStudies + portfolio, blogs, caseStudies, portfolio }
}

/** Views over time, top pages, enquiries and publishing for one range. */
export async function overview(rangeValue: unknown) {
  const days = parseRange(rangeValue)
  const { start, end, prevStart } = periods(days)
  const range = [isoDay(start), isoDay(end)]

  const [views, prevViews, pages, daily, top, enquiries, prevEnquiries, byService, published, prevPublished, first] =
    await Promise.all([
      sumViews(start, end),
      sumViews(prevStart, start),
      queryOne<Row>('SELECT COUNT(DISTINCT path) AS n FROM page_views WHERE day >= ? AND day < ?', range),
      query<Row>(
        `SELECT DATE_FORMAT(day, '%Y-%m-%d') AS day, SUM(count) AS views FROM page_views WHERE day >= ? AND day < ? GROUP BY day`,
        range,
      ),
      query<Row>(
        `SELECT path, SUM(count) AS views FROM page_views WHERE day >= ? AND day < ?
          GROUP BY path ORDER BY views DESC, path ASC LIMIT 10`,
        range,
      ),
      countEnquiries(start, end),
      countEnquiries(prevStart, start),
      query<Row>(
        `SELECT COALESCE(NULLIF(service, ''), 'Not specified') AS service, COUNT(*) AS n FROM enquiries
          WHERE created_at >= ? AND created_at < ? GROUP BY 1 ORDER BY n DESC`,
        [start, end],
      ),
      publishedBetween(start, end),
      publishedBetween(prevStart, start),
      queryOne<Row>("SELECT DATE_FORMAT(MIN(day), '%Y-%m-%d') AS day FROM page_views"),
    ])

  const perDay = new Map(daily.map((d) => [String(d.day), n(d.views)]))
  // Every day in the range, including the ones nobody visited — a chart with
  // gaps reads as a tracking fault.
  const series = Array.from({ length: days }, (_, i) => {
    const date = isoDay(new Date(start.getTime() + i * DAY))
    return { date, views: perDay.get(date) ?? 0 }
  })
  const label = await labelPaths(top.map((t) => t.path as string))

  return {
    days,
    trackingSince: (first?.day as string | null) ?? null,
    stats: {
      views: { value: views, change: change(views, prevViews) },
      pages: n(pages?.n),
      enquiries: { value: enquiries, change: change(enquiries, prevEnquiries) },
      published: { value: published.total, change: change(published.total, prevPublished.total), ...published },
    },
    series,
    topPages: top.map((t) => ({ path: t.path as string, label: label(t.path as string), views: n(t.views) })),
    enquiriesByService: byService.map((s) => ({ service: s.service as string, count: n(s.n) })),
  }
}

export const PERFORMANCE_SORTS = ['range', 'total', 'published', 'title'] as const
type PerformanceSort = (typeof PERFORMANCE_SORTS)[number]

/** Per-article and per-case-study views: all-time and within the range. */
export async function contentPerformance(raw: { range?: unknown; type?: unknown; sort?: unknown }) {
  const days = parseRange(raw.range)
  const type = raw.type === 'blog' || raw.type === 'case_study' ? raw.type : undefined
  const sort: PerformanceSort = (PERFORMANCE_SORTS as readonly unknown[]).includes(raw.sort)
    ? (raw.sort as PerformanceSort)
    : 'range'
  const { start, end } = periods(days)

  const [blogs, cases, recent] = await Promise.all([
    type === 'case_study'
      ? []
      : query<Row>('SELECT id, title, slug, status, published_at, views, read_minutes FROM blogs'),
    type === 'blog' ? [] : query<Row>('SELECT id, title, slug, status, published_at, views FROM case_studies'),
    query<Row>(
      `SELECT content_id, SUM(count) AS views FROM page_views
        WHERE day >= ? AND day < ? AND content_id IS NOT NULL GROUP BY content_id`,
      [isoDay(start), isoDay(end)],
    ),
  ])
  const rangeViews = new Map(recent.map((r) => [r.content_id as string, n(r.views)]))

  const rows = [
    ...blogs.map((b) => ({ row: b, type: 'blog' as const, url: `/blog/${b.slug as string}` })),
    ...cases.map((c) => ({ row: c, type: 'case_study' as const, url: `/case-studies/${c.slug as string}` })),
  ].map(({ row, type: kind, url }) => ({
    id: row.id as string,
    title: row.title as string,
    type: kind,
    status: row.status as string,
    url,
    readMinutes: row.read_minutes == null ? null : n(row.read_minutes),
    publishedAt: (row.published_at as string | null) ?? null,
    totalViews: n(row.views),
    rangeViews: rangeViews.get(row.id as string) ?? 0,
  }))

  type Item = (typeof rows)[number]
  const by: Record<PerformanceSort, (a: Item, b: Item) => number> = {
    range: (a, b) => b.rangeViews - a.rangeViews || b.totalViews - a.totalViews,
    total: (a, b) => b.totalViews - a.totalViews || b.rangeViews - a.rangeViews,
    published: (a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
    title: (a, b) => a.title.localeCompare(b.title),
  }
  rows.sort(by[sort])

  const live = rows.filter((r) => r.status === 'published')
  const top = [...rows].sort(by.range)[0]
  return {
    query: { range: days, type: type ?? null, sort },
    rows,
    stats: {
      totalViews: rows.reduce((sum, r) => sum + r.totalViews, 0),
      rangeViews: rows.reduce((sum, r) => sum + r.rangeViews, 0),
      published: live.length,
      average: live.length ? Math.round(live.reduce((sum, r) => sum + r.totalViews, 0) / live.length) : 0,
      top: top && top.rangeViews > 0 ? { title: top.title, views: top.rangeViews } : null,
    },
  }
}
