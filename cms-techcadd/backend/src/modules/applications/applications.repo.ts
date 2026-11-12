import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import type { ListParams, ListResult } from '../../http/listParams.js'
import { listRows, placeholders } from '../shared/list.js'
import type { ApplicationPatch, PublicApplication } from './applications.schema.js'
import { deleteCv, type StoredCv } from './cv-storage.js'

const SORTABLE: Record<string, string> = {
  name: 'a.name',
  email: 'a.email',
  jobTitle: 'a.job_title',
  status: 'a.status',
  createdAt: 'a.created_at',
  updatedAt: 'a.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'a.status',
  jobId: 'a.job_id',
  createdAt: 'a.created_at',
  updatedAt: 'a.updated_at',
}

/**
 * An application as the CMS shows it.
 *
 * `cvKey` is deliberately absent: it is a storage path, and the only way to the
 * file is the download route, which checks the session first.
 */
function toApplication(row: Row): unknown {
  return {
    id: row.id,
    jobId: row.job_id ?? undefined,
    jobTitle: row.job_title,
    jobSlug: row.job_slug ?? undefined,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    location: row.location ?? undefined,
    linkedinUrl: row.linkedin_url ?? undefined,
    portfolioUrl: row.portfolio_url ?? undefined,
    coverLetter: row.cover_letter ?? undefined,
    cv: { filename: row.cv_filename, mime: row.cv_mime, size: Number(row.cv_size ?? 0) },
    status: row.status,
    notes: row.notes ?? '',
    ip: row.ip ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT = 'a.*, j.slug AS job_slug'
const FROM = 'FROM job_applications a LEFT JOIN jobs j ON j.id = a.job_id'

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { rows, total } = await listRows(params, {
    from: FROM,
    select: SELECT,
    sortable: SORTABLE,
    filterable: FILTERABLE,
    searchColumns: ['a.name', 'a.email', 'a.job_title', 'a.location'],
    fallbackSort: { column: 'a.created_at', dir: 'desc' },
  })
  return { items: rows.map(toApplication), total, page: params.page, pageSize: params.pageSize }
}

async function loadRow(id: string): Promise<Row> {
  const row = await queryOne<Row>(`SELECT ${SELECT} ${FROM} WHERE a.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Application')
  return row
}

/** Opening a new application moves it to "reviewing", as reading an enquiry marks it read. */
export async function get(id: string, markReviewing = false): Promise<unknown> {
  if (markReviewing) {
    await execute(
      "UPDATE job_applications SET status = 'reviewing', updated_at = NOW(3) WHERE id = ? AND status = 'new'",
      [id],
    )
  }
  return toApplication(await loadRow(id))
}

export async function update(id: string, patch: ApplicationPatch): Promise<unknown> {
  await loadRow(id)
  const assignments: string[] = []
  const params: unknown[] = []
  if (patch.status !== undefined) {
    assignments.push('status = ?')
    params.push(patch.status)
  }
  if (patch.notes !== undefined) {
    assignments.push('notes = ?')
    params.push(patch.notes.trim() || null)
  }
  if (assignments.length > 0) {
    await execute(`UPDATE job_applications SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`, [
      ...params,
      id,
    ])
  }
  return get(id)
}

/** The stored file's details, for the download route. */
export async function cvFor(id: string): Promise<{ key: string; filename: string; mime: string }> {
  const row = await loadRow(id)
  return { key: row.cv_key as string, filename: row.cv_filename as string, mime: row.cv_mime as string }
}

/**
 * Removes applications and their CVs.
 *
 * Rows first, then files — the same order as media: a failure can leave an
 * orphaned file nobody can reach, never a row pointing at a missing CV.
 */
export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const rows = await query<Row>(`SELECT cv_key FROM job_applications WHERE id IN (${placeholders(ids)})`, ids)
  await execute(`DELETE FROM job_applications WHERE id IN (${placeholders(ids)})`, ids)
  for (const row of rows) await deleteCv(row.cv_key as string)
}

/** One application per person per opening — this also absorbs double-clicks. */
export async function hasApplied(jobId: string, email: string): Promise<boolean> {
  const row = await queryOne<Row>('SELECT id FROM job_applications WHERE job_id = ? AND email = ? LIMIT 1', [
    jobId,
    email,
  ])
  return Boolean(row)
}

export async function createFromWebsite(
  job: { id: string; title: string },
  input: PublicApplication,
  cv: StoredCv,
  origin: { ip?: string; userAgent?: string },
): Promise<{ id: string }> {
  const id = randomUUID()
  const blank = (value: string | undefined) => value?.trim() || null
  await execute(
    `INSERT INTO job_applications
       (id, job_id, job_title, name, email, phone, location, linkedin_url, portfolio_url, cover_letter,
        cv_key, cv_filename, cv_mime, cv_size, status, ip, user_agent, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, NOW(3), NOW(3))`,
    [
      id,
      job.id,
      job.title,
      input.name,
      input.email,
      blank(input.phone),
      blank(input.location),
      blank(input.linkedinUrl),
      blank(input.portfolioUrl),
      blank(input.coverLetter),
      cv.key,
      cv.filename,
      cv.mime,
      cv.size,
      origin.ip?.slice(0, 45) ?? null,
      origin.userAgent?.slice(0, 255) ?? null,
    ],
  )
  return { id }
}
