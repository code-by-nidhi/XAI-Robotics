import { query, queryOne, type Row } from '../../db/pool.js'
import * as enquiriesRepo from '../enquiries/enquiries.repo.js'

/** One scalar count. */
async function count(sql: string, params: unknown[] = []): Promise<number> {
  const row = await queryOne<{ n: number }>(sql, params)
  return Number(row?.n ?? 0)
}

export interface TrendPoint {
  /** ISO date, oldest first. */
  date: string
  value: number
}

/**
 * Enquiries per day for the last seven days, including days with none.
 *
 * Grouped in SQL rather than in the browser, so the chart costs seven numbers
 * over the wire rather than the whole table.
 */
async function enquiryTrend(): Promise<TrendPoint[]> {
  const rows = await query<Row>(
    `SELECT DATE(created_at) AS day, COUNT(*) AS n
       FROM enquiries
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)`,
  )

  const counts = new Map<string, number>()
  for (const row of rows) counts.set(String(row.day), Number(row.n))

  // The query only returns days that have rows; the chart needs all seven.
  const today = new Date()
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - offset))
    const key = localDate(date)
    return { date: key, value: counts.get(key) ?? 0 }
  })
}

/**
 * A YYYY-MM-DD key in the server's own timezone.
 *
 * Not `toISOString()`, which is UTC. The counts above come from MySQL's
 * `DATE(created_at)` and the window from `CURDATE()`, both the server's local
 * date — a UTC key would not match them wherever the two disagree, and in IST
 * that is every evening from 18:30.
 */
function localDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** The content types the dashboard tracks: table, URL segment, title column. */
const CONTENT = [
  { kind: 'blogs', table: 'blogs', title: 'title' },
  { kind: 'case-studies', table: 'case_studies', title: 'title' },
  { kind: 'portfolio', table: 'portfolio', title: 'title' },
  { kind: 'jobs', table: 'jobs', title: 'title' },
] as const

interface Recent {
  id: string
  title: string
  kind: (typeof CONTENT)[number]['kind']
  status: string
  updatedAt: string
}

/**
 * The most recently touched content across every type.
 *
 * UNION ALL, so the database does the interleaving and returns eight rows
 * rather than four pages the client has to merge and trim.
 */
async function recentContent(): Promise<Recent[]> {
  const rows = await query<Row>(
    `${CONTENT.map(
      ({ kind, table, title }) =>
        `(SELECT id, ${title} AS title, '${kind}' AS kind, status, updated_at FROM ${table} ORDER BY updated_at DESC LIMIT 8)`,
    ).join(' UNION ALL ')}
     ORDER BY updated_at DESC
     LIMIT 8`,
  )

  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    kind: row.kind as Recent['kind'],
    status: row.status as string,
    updatedAt: row.updated_at as string,
  }))
}

/** Counts by status across every content table. */
async function contentOverview(): Promise<Record<string, number>> {
  const rows = await query<Row>(
    `SELECT status, SUM(n) AS n FROM (
       ${CONTENT.map(({ table }) => `SELECT status, COUNT(*) AS n FROM ${table} GROUP BY status`).join(' UNION ALL ')}
     ) AS combined
     GROUP BY status`,
  )

  const overview = { published: 0, draft: 0, scheduled: 0, archived: 0, total: 0 }
  for (const row of rows) {
    const status = String(row.status) as keyof typeof overview
    if (status in overview) overview[status] = Number(row.n)
  }
  overview.total = overview.published + overview.draft + overview.scheduled + overview.archived
  return overview
}

/** The audit trail's latest entries, for the "what changed" panel. */
async function recentActivity(): Promise<unknown[]> {
  const rows = await query<Row>(
    `SELECT id, user_name, action, entity_type, entity_id, entity_label, created_at
       FROM activity_log ORDER BY created_at DESC LIMIT 10`,
  )
  return rows.map((row) => ({
    id: row.id,
    userName: row.user_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? null,
    entityLabel: row.entity_label ?? null,
    createdAt: row.created_at,
  }))
}

/**
 * Everything the dashboard needs, in one request.
 *
 * `canSeeLeads` is whether the caller cleared the enquiries gate: the counts
 * are not personal data and are always shown, but the recent enquiries list is
 * names and email addresses, and the dashboard must not be a way round the
 * password that protects them.
 */
export async function summary(canSeeLeads: boolean): Promise<unknown> {
  const [
    blogs, caseStudies, portfolio, jobs, openJobs, applications, enquiries,
    newEnquiriesToday, newApplicationsToday, unreadEnquiries, newApplications, scheduled,
    trend, overview, content, activity, recentEnquiries,
  ] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM blogs'),
    count('SELECT COUNT(*) AS n FROM case_studies'),
    count('SELECT COUNT(*) AS n FROM portfolio'),
    count('SELECT COUNT(*) AS n FROM jobs'),
    count(
      `SELECT COUNT(*) AS n FROM jobs j
        WHERE (j.status = 'published' OR (j.status = 'scheduled' AND j.publish_at <= NOW(3)))
          AND (j.closing_date IS NULL OR j.closing_date >= CURDATE())`,
    ),
    count('SELECT COUNT(*) AS n FROM job_applications'),
    count('SELECT COUNT(*) AS n FROM enquiries'),

    count('SELECT COUNT(*) AS n FROM enquiries WHERE DATE(created_at) = CURDATE()'),
    count('SELECT COUNT(*) AS n FROM job_applications WHERE DATE(created_at) = CURDATE()'),
    count("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'"),
    count("SELECT COUNT(*) AS n FROM job_applications WHERE status = 'new'"),
    count(
      `SELECT SUM(n) AS n FROM (${CONTENT.map(
        ({ table }) => `SELECT COUNT(*) AS n FROM ${table} WHERE status = 'scheduled' AND publish_at > NOW(3)`,
      ).join(' UNION ALL ')}) AS s`,
    ),

    enquiryTrend(),
    contentOverview(),
    recentContent(),
    recentActivity(),

    // Through the module's own list, so these rows are exactly what
    // /api/enquiries returns and the dashboard needs no separate shape.
    canSeeLeads
      ? enquiriesRepo.list({ page: 1, pageSize: 8, sort: { field: 'createdAt', dir: 'desc' }, filters: {} })
      : Promise.resolve({ items: [] as unknown[] }),
  ])

  return {
    totals: { blogs, caseStudies, portfolio, jobs, openJobs, applications, enquiries },
    today: {
      newEnquiries: newEnquiriesToday,
      newApplications: newApplicationsToday,
      unreadEnquiries,
      unreviewedApplications: newApplications,
      scheduled,
    },
    enquiryTrend: trend,
    contentOverview: overview,
    recentContent: content,
    recentActivity: activity,
    recentEnquiries: recentEnquiries.items,
  }
}
