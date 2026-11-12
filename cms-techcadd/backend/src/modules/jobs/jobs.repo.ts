import { query, queryOne, type Row } from '../../db/pool.js'
import { contentRepo, publicBySlug, publicSeo, text } from '../shared/contentRepo.js'
import { seoOf, stringsOf, type FieldMap } from '../shared/fields.js'
import { liveSql, publishedAtSql } from '../shared/publishing.js'
import {
  EMPLOYMENT_LABELS,
  WORK_MODE_LABELS,
  type JobInput,
  type JobPatch,
} from './jobs.schema.js'

const FIELDS: FieldMap = {
  title: { column: 'title', kind: 'text' },
  slug: { column: 'slug', kind: 'text' },
  department: { column: 'department', kind: 'optional' },
  location: { column: 'location', kind: 'optional' },
  employmentType: { column: 'employment_type', kind: 'text' },
  workMode: { column: 'work_mode', kind: 'text' },
  experience: { column: 'experience', kind: 'optional' },
  salary: { column: 'salary', kind: 'optional' },
  summary: { column: 'summary', kind: 'text' },
  description: { column: 'description', kind: 'html' },
  responsibilities: { column: 'responsibilities', kind: 'json' },
  requirements: { column: 'requirements', kind: 'json' },
  benefits: { column: 'benefits', kind: 'json' },
  closingDate: { column: 'closing_date', kind: 'optional' },
  sortOrder: { column: 'sort_order', kind: 'number' },
}

/** DATE columns come back as YYYY-MM-DD strings (dateStrings in pool.ts). */
const day = (value: unknown): string | undefined => (value ? String(value).slice(0, 10) : undefined)

function toAdmin(row: Row): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department ?? undefined,
    location: row.location ?? undefined,
    employmentType: row.employment_type,
    workMode: row.work_mode,
    experience: row.experience ?? undefined,
    salary: row.salary ?? undefined,
    summary: row.summary,
    description: text(row.description),
    responsibilities: stringsOf(row.responsibilities),
    requirements: stringsOf(row.requirements),
    benefits: stringsOf(row.benefits),
    closingDate: day(row.closing_date),
    sortOrder: Number(row.sort_order ?? 0),
    applications: Number(row.application_count ?? 0),
    status: row.status,
    publishAt: row.publish_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    seo: seoOf(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function publishProblems(j: Record<string, unknown>): Record<string, string> {
  const problems: Record<string, string> = {}
  if (!text(j.title).trim()) problems.title = 'Add a job title.'
  if (text(j.summary).trim().length < 20) {
    problems.summary = 'Add a summary of at least 20 characters before publishing.'
  }
  if (!Array.isArray(j.responsibilities) || j.responsibilities.length === 0) {
    problems.responsibilities = 'Add at least one responsibility.'
  }
  if (!Array.isArray(j.requirements) || j.requirements.length === 0) {
    problems.requirements = 'Add at least one requirement.'
  }
  return problems
}

const repo = contentRepo<JobInput, JobPatch>({
  table: 'jobs',
  alias: 'j',
  label: 'Job opening',
  fields: FIELDS,
  seo: true,
  media: [{ column: 'og_image_id', as: 'og' }],
  // How many people applied, for the openings list.
  extraSelect: '(SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) AS application_count',
  sortable: {
    title: 'j.title',
    department: 'j.department',
    status: 'j.status',
    closingDate: 'j.closing_date',
    sortOrder: 'j.sort_order',
    createdAt: 'j.created_at',
    updatedAt: 'j.updated_at',
  },
  filterable: {
    status: 'j.status',
    department: 'j.department',
    employmentType: 'j.employment_type',
    workMode: 'j.work_mode',
    closingDate: 'j.closing_date',
    createdAt: 'j.created_at',
    updatedAt: 'j.updated_at',
  },
  searchColumns: ['j.title', 'j.slug', 'j.department', 'j.location', 'j.summary'],
  fallbackSort: { column: 'j.sort_order', dir: 'asc' },
  toAdmin,
  redirectType: 'job',
  publishProblems,
})

export const { list, get, create, update, remove } = repo

/* ------------------------------------------------------------------ */
/* Public                                                               */
/* ------------------------------------------------------------------ */

/** Live, and still taking applications — the closing day itself included. */
export const OPEN = `${liveSql('j')} AND (j.closing_date IS NULL OR j.closing_date >= CURDATE())`
const PUBLIC_SELECT = `${repo.select}, ${publishedAtSql('j')} AS public_at`

function toPublic(row: Row, withContent: boolean) {
  const employmentType = row.employment_type as keyof typeof EMPLOYMENT_LABELS
  const workMode = row.work_mode as keyof typeof WORK_MODE_LABELS
  return {
    slug: row.slug as string,
    title: row.title as string,
    department: text(row.department),
    location: text(row.location),
    employmentType,
    employmentTypeLabel: EMPLOYMENT_LABELS[employmentType] ?? '',
    workMode,
    workModeLabel: WORK_MODE_LABELS[workMode] ?? '',
    experience: text(row.experience),
    salary: text(row.salary),
    summary: text(row.summary),
    closingDate: day(row.closing_date) ?? null,
    publishedAt: row.public_at as string,
    ...(withContent
      ? {
          descriptionHtml: text(row.description),
          responsibilities: stringsOf(row.responsibilities),
          requirements: stringsOf(row.requirements),
          benefits: stringsOf(row.benefits),
          seo: publicSeo(row),
        }
      : {}),
  }
}

export async function publicList(): Promise<unknown[]> {
  const rows = await query<Row>(
    `SELECT ${PUBLIC_SELECT} ${repo.from} WHERE ${OPEN} ORDER BY j.sort_order ASC, public_at DESC`,
  )
  return rows.map((row) => toPublic(row, false))
}

export function publicGet(slug: string) {
  return publicBySlug({
    select: PUBLIC_SELECT,
    from: repo.from,
    alias: 'j',
    where: OPEN,
    redirectType: 'job',
    slug,
    map: (row) => toPublic(row, true),
  })
}

/** The opening an application is for, only while it is open. */
export async function openJob(slug: string): Promise<{ id: string; title: string } | undefined> {
  const row = await queryOne<Row>(`SELECT j.id, j.title FROM jobs j WHERE j.slug = ? AND ${OPEN} LIMIT 1`, [slug])
  return row ? { id: row.id as string, title: row.title as string } : undefined
}
