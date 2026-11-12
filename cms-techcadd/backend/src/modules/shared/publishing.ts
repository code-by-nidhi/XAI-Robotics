import { execute, queryOne, type Row } from '../../db/pool.js'
import { unprocessable } from '../../http/errors.js'
import type { ContentStatus } from './content.schema.js'

/**
 * The publishing rules every content type shares.
 *
 *   draft      not on the site
 *   published  on the site; published_at is set the first time and then kept,
 *              so re-publishing an edited post does not move it up the blog
 *   scheduled  on the site from publish_at, which must be in the future when
 *              set — the public queries compare the time themselves, so
 *              nothing has to run at that moment
 *   archived   off the site, kept for the record
 */

/**
 * The SQL that decides whether a row is public.
 *
 * Written once and interpolated (it contains no input), so the website, the
 * tag counts, the analytics labels and the redirect resolver cannot disagree
 * about what "live" means.
 */
export function liveSql(alias: string): string {
  return `(${alias}.status = 'published' OR (${alias}.status = 'scheduled' AND ${alias}.publish_at <= NOW(3)))`
}

/** When it went live, for ordering and display. */
export function publishedAtSql(alias: string): string {
  return `COALESCE(${alias}.published_at, ${alias}.publish_at, ${alias}.updated_at)`
}

interface Current {
  status: ContentStatus
  publish_at: string | null
  published_at: string | null
}

/** A DATETIME string from the driver, read in the same zone it was written. */
const fromDb = (value: string | null): Date | null => (value ? new Date(value.replace(' ', 'T')) : null)

/**
 * The status columns a save should write.
 *
 * `status` absent on a patch means "unchanged"; `publishAt` on its own is only
 * honoured for something already scheduled (moving the date). Anything that
 * makes the item scheduled checks the moment is still ahead — a minute's grace
 * for the time the editor spent on the form.
 */
export function publishingColumns(
  input: { status?: ContentStatus; publishAt?: string | null },
  current?: Current,
): Record<string, unknown> {
  const status = input.status ?? current?.status ?? 'draft'
  const columns: Record<string, unknown> = {}
  if (input.status !== undefined || !current) columns.status = status

  if (status === 'published' && (input.status !== undefined || !current)) {
    const first = fromDb(current?.published_at ?? null) ?? new Date()
    columns.published_at = first
    columns.publish_at = first
  }

  if (status === 'scheduled') {
    const requested = input.publishAt ? new Date(input.publishAt) : null
    const existing = fromDb(current?.publish_at ?? null)
    const at = requested ?? (current?.status === 'scheduled' ? existing : null)

    if (!at) throw unprocessable({ publishAt: 'Choose a date and time to publish.' })

    const changed = !existing || Math.abs(at.getTime() - existing.getTime()) > 1000
    if (changed && at.getTime() < Date.now() + 60_000) {
      throw unprocessable({ publishAt: 'Choose a time at least a minute in the future.' })
    }
    columns.publish_at = at
  }

  return columns
}

/** Whether the item ends up on the site — the moment publish checks apply. */
export function goesLive(status: ContentStatus): boolean {
  return status === 'published' || status === 'scheduled'
}

/**
 * Fails the save with every missing field at once, keyed for the form.
 *
 * A draft may be half-written; content that is about to be public may not.
 */
export function assertPublishable(problems: Record<string, string>): void {
  if (Object.keys(problems).length > 0) throw unprocessable(problems)
}

/* ------------------------------------------------------------------ */
/* Old slugs                                                            */
/* ------------------------------------------------------------------ */

export type RedirectType = 'blog' | 'case_study' | 'portfolio' | 'job'

/**
 * Records a rename, so the old address keeps working.
 *
 * Only for content that has been public — nobody links to a draft. Points at
 * the id, so a second rename needs no chain. Any redirect *from* the new slug
 * is dropped first: the slug has an owner again.
 */
export async function recordSlugChange(
  type: RedirectType,
  targetId: string,
  oldSlug: string,
  newSlug: string,
  wasPublic: boolean,
): Promise<void> {
  if (oldSlug === newSlug) return
  await releaseSlug(type, newSlug)
  if (!wasPublic) return
  await execute(
    `INSERT INTO slug_redirects (id, type, from_slug, target_id, created_at)
     VALUES (UUID(), ?, ?, ?, NOW(3))
     ON DUPLICATE KEY UPDATE target_id = VALUES(target_id)`,
    [type, oldSlug, targetId],
  )
}

/** New content took over a slug: an old redirect for it no longer applies. */
export async function releaseSlug(type: RedirectType, slug: string): Promise<void> {
  await execute('DELETE FROM slug_redirects WHERE type = ? AND from_slug = ?', [type, slug])
}

/** The id an old slug points at, if any. */
export async function redirectTarget(type: RedirectType, slug: string): Promise<string | undefined> {
  const row = await queryOne<Row>(
    'SELECT target_id FROM slug_redirects WHERE type = ? AND from_slug = ? LIMIT 1',
    [type, slug],
  )
  return (row?.target_id as string | undefined) ?? undefined
}

/** Whether a row had been public before this save — the redirect condition. */
export function wasPublic(current: Current): boolean {
  return Boolean(current.published_at) || current.status === 'published'
}

/* ------------------------------------------------------------------ */
/* Scheduled release                                                    */
/* ------------------------------------------------------------------ */

const SCHEDULED_TABLES = ['blogs', 'case_studies', 'portfolio', 'jobs']
const RELEASE_EVERY_MS = 30_000
let lastRelease = 0

/**
 * Flips due scheduled items to published.
 *
 * Not needed for visibility — the public queries already treat a due item as
 * live — but without it the CMS lists would show "scheduled" for something
 * that has been on the site for a week, and published_at would stay empty.
 * Called from the read paths rather than a timer, throttled so a busy site
 * costs one indexed UPDATE per table every half minute at most.
 */
export async function releaseDueContent(): Promise<void> {
  if (Date.now() - lastRelease < RELEASE_EVERY_MS) return
  lastRelease = Date.now()
  for (const table of SCHEDULED_TABLES) {
    await execute(
      `UPDATE ${table}
          SET status = 'published', published_at = COALESCE(published_at, publish_at)
        WHERE status = 'scheduled' AND publish_at <= NOW(3)`,
    )
  }
}
