/**
 * One-off import: the Zaavi website's built-in (Prisma) CMS → this CMS.
 *
 *   npm run import:zaavi                      # from cms-techcadd/backend
 *   SOURCE_DB_NAME=zaavi_cms SOURCE_ROOT=../.. npm run import:zaavi
 *
 * Reads the old database (read-only session, never written) and the old
 * project's files (storage/uploads, public/images, storage/applications), and
 * writes straight into DB_NAME, UPLOAD_DIR and PRIVATE_DIR from .env.
 *
 * Re-runnable. Every imported row gets a deterministic UUID derived from its
 * source id (`uid(table, sourceId)`), and every write is an upsert, so a second
 * run updates the same rows instead of adding new ones. A row that already
 * exists in the target under the same natural key (slug, email,
 * tag slug/name, path+day) is reused and updated in place rather than
 * duplicated. Media files are named after the media row's id, so they are
 * copied once and skipped afterwards. Re-running overwrites migrated rows with
 * the source values again — edits made in the new CMS to imported rows are
 * lost on a re-run, so stop re-running once editors have started.
 */
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'

import mysql from 'mysql2/promise'

import { config } from '../src/config.js'
import { execute, pool, queryOne, type Row } from '../src/db/pool.js'
import { readDimensions } from '../src/modules/media/dimensions.js'
import { publicUrl, uploadRoot } from '../src/modules/media/storage.js'
import {
  BLOG_CATEGORIES,
  CASE_STUDY_CATEGORIES,
  PORTFOLIO_CATEGORIES,
  SERVICES,
  type Category,
} from '../src/modules/shared/taxonomy.js'

const SOURCE_DB = process.env.SOURCE_DB_NAME ?? 'zaavi_cms'
/** The old Zaavi project root (holds storage/ and public/). Default: two levels up from the backend. */
const SOURCE_ROOT = resolve(process.env.SOURCE_ROOT ?? '../..')
const PRIVATE_ROOT = resolve(config.PRIVATE_DIR, 'applications')

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** A stable UUID (v5-shaped) for a source row, so re-runs hit the same target row. */
function uid(table: string, sourceId: string): string {
  const h = createHash('sha1').update(`zaavi-import:${table}:${sourceId}`).digest()
  h[6] = (h[6]! & 0x0f) | 0x50
  h[8] = (h[8]! & 0x3f) | 0x80
  const x = h.subarray(0, 16).toString('hex')
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`
}

/** Prisma stores DateTime as UTC; this CMS stores local time (mysql2 writes Dates in local time). */
const utc = (v: unknown): Date | null => (v ? new Date(String(v).replace(' ', 'T') + 'Z') : null)
const lower = (v: unknown) => String(v).toLowerCase()
const str = (v: unknown): string | null => (v === null || v === undefined ? null : String(v))

const warnings: string[] = []
const warn = (msg: string) => warnings.push(msg)

function fit(v: unknown, max: number, where: string): string | null {
  const s = str(v)
  if (s !== null && s.length > max) {
    warn(`${where}: truncated from ${s.length} to ${max} characters`)
    return s.slice(0, max)
  }
  return s
}

function parseJson(v: unknown): unknown {
  if (v === null || v === undefined) return null
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}
const jsonList = (v: unknown) => JSON.stringify(parseJson(v) ?? [])

const isEmpty = (v: unknown) => {
  if (v === null || v === undefined || v === '' || v === 0 || v === false) return true
  const p = parseJson(v)
  return Array.isArray(p) && p.length === 0
}
/** A source field the new schema has no place for: reported when it actually held data. */
function dropped(where: string, fields: Record<string, unknown>) {
  for (const [name, value] of Object.entries(fields)) {
    if (!isEmpty(value)) warn(`${where}: "${name}" not migrated (no column in the new schema)`)
  }
}

const q = (c: string) => `\`${c}\``

/** INSERT … ON DUPLICATE KEY UPDATE every column except the keys and `noUpdate`. */
async function upsert(table: string, row: Record<string, unknown>, noUpdate: string[] = []): Promise<void> {
  const cols = Object.keys(row)
  const keep = new Set(['id', ...noUpdate])
  const updates = cols.filter((c) => !keep.has(c)).map((c) => `${q(c)} = VALUES(${q(c)})`)
  await execute(
    `INSERT INTO ${table} (${cols.map(q).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${updates.length ? updates.join(', ') : 'id = id'}`,
    cols.map((c) => row[c] ?? null),
  )
}

/** The deterministic id, unless the target already has a row under the natural key. */
async function idFor(table: string, sourceId: string, where?: Record<string, unknown>): Promise<string> {
  if (where) {
    const keys = Object.keys(where)
    const existing = await queryOne<Row>(
      `SELECT id FROM ${table} WHERE ${keys.map((k) => `${q(k)} = ?`).join(' AND ')} LIMIT 1`,
      keys.map((k) => where[k]),
    )
    if (existing) return String(existing.id)
  }
  return uid(table, sourceId)
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

type Stat = { source: number; imported: number; skipped: number }
const stats: Record<string, Stat> = {}
const tally = (type: string) => (stats[type] ??= { source: 0, imported: 0, skipped: 0 })

/* ------------------------------------------------------------------ */
/* Source                                                               */
/* ------------------------------------------------------------------ */

const src = await mysql.createConnection({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: SOURCE_DB,
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
})
// Belt and braces: the old database is only ever read.
await src.query('SET SESSION TRANSACTION READ ONLY')

async function S(sql: string): Promise<Row[]> {
  const [rows] = await src.query(sql)
  return rows as Row[]
}

/** Source id → target id, per content type (also used for page views and redirects). */
const ids = {
  user: new Map<string, string>(),
  tag: new Map<string, string>(),
  blog: new Map<string, string>(),
  case_study: new Map<string, string>(),
  portfolio: new Map<string, string>(),
  job: new Map<string, string>(),
  faq: new Map<string, string>(),
}
const mediaMap = new Map<string, string>() // old media id → new media id
const urlMap = new Map<string, string>() // old url (and /uploads/<storageKey>) → new url
const userName = new Map<string, string>()

const user = (id: unknown) => (id ? (ids.user.get(String(id)) ?? null) : null)
const mediaRef = (id: unknown) => (id ? (mediaMap.get(String(id)) ?? null) : null)
/** Source category id → its type and slug (categories are a fixed list here, not rows). */
const sourceCategory = new Map<string, { type: string; slug: string }>()

/**
 * The slug to store for a source category, or null.
 *
 * Only a slug on this CMS's fixed list for the type is kept: anything else
 * would be refused by the form on the next save. Dropped ones are reported.
 */
function category(id: unknown, list: readonly Category[], where: string): string | null {
  if (!id) return null
  const found = sourceCategory.get(String(id))
  if (found && list.some((c) => c.slug === found.slug)) return found.slug
  warn(`${where}: category ${found ? `${found.type}/${found.slug}` : String(id)} is not on the fixed list; left empty`)
  return null
}

/** A service slug on the fixed SERVICES list, or null (reported). */
function serviceSlug(value: unknown, where: string): string | null {
  if (!value) return null
  const slug = String(value)
  if (SERVICES.some((s) => s.slug === slug)) return slug
  warn(`${where}: service "${slug}" is not on the fixed list; left empty`)
  return null
}

/** Embedded image URLs → the copied files. */
function rewriteHtml(html: unknown, where: string): string | null {
  if (html === null || html === undefined) return null
  let out = String(html)
  // Absolute URLs (e.g. Cloudinary) recorded on a media row.
  for (const [from, to] of urlMap) if (/^https?:/.test(from)) out = out.split(from).join(to)
  return out.replace(
    /(?:https?:\/\/[^/"'\s<>]+)?(\/(?:uploads|images)\/[^"'\s)<>?#]+)/g,
    (match, path: string) => {
      const mapped = urlMap.get(path)
      if (mapped) return mapped
      if (/^\/uploads\/\d{4}\/\d{2}\//.test(path)) warn(`${where}: embedded ${path} has no media row; left as is`)
      return match
    },
  )
}

const authorship = (r: Row) => ({
  created_by: user(r.createdById),
  updated_by: user(r.updatedById),
  created_at: utc(r.createdAt),
  updated_at: utc(r.updatedAt),
})
const publishing = (r: Row) => ({
  status: lower(r.status),
  publish_at: utc(r.publishAt),
  published_at: utc(r.publishedAt),
})
const seo = (r: Row, where: string) => ({
  meta_title: fit(r.seoTitle, 120, `${where} seoTitle`),
  meta_description: fit(r.seoDescription, 255, `${where} seoDescription`),
  canonical_url: fit(r.canonicalUrl, 500, `${where} canonicalUrl`),
  og_title: fit(r.ogTitle, 200, `${where} ogTitle`),
  og_description: fit(r.ogDescription, 320, `${where} ogDescription`),
  og_image_id: mediaRef(r.ogImageId),
  no_index: r.noIndex ? 1 : 0,
})

/** Soft-deleted rows are not migrated. */
async function live(model: string, where = ''): Promise<{ rows: Row[]; deleted: number }> {
  const all = await S(`SELECT * FROM \`${model}\`${where}`)
  const rows = all.filter((r) => !r.deletedAt)
  return { rows, deleted: all.length - rows.length }
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

/** Not an argon2 hash, so no password verifies until someone resets it. */
const NO_PASSWORD = '!zaavi-import:password-reset-required'
const needsReset: string[] = []

async function importUsers() {
  const t = tally('users')
  const rows = await S('SELECT u.*, r.`key` AS roleKey FROM `User` u JOIN `Role` r ON r.id = u.roleId')
  t.source = rows.length
  for (const r of rows) {
    userName.set(String(r.id), String(r.name))
    if (r.deletedAt) {
      t.skipped++
      warn(`user ${r.email}: deleted in Zaavi, not migrated`)
      continue
    }
    const existing = await queryOne<Row>('SELECT id, title, bio, password_hash FROM users WHERE LOWER(email) = LOWER(?)', [
      r.email,
    ])
    if (existing) {
      // An account already here (the seeded admin) keeps its login and role.
      ids.user.set(String(r.id), String(existing.id))
      await execute('UPDATE users SET title = COALESCE(title, ?), bio = COALESCE(bio, ?) WHERE id = ?', [
        r.title ?? null,
        r.bio ?? null,
        existing.id,
      ])
      if (String(existing.password_hash) === NO_PASSWORD) needsReset.push(`${r.email} (${r.roleKey})`)
      t.imported++
      continue
    }
    const id = uid('users', String(r.id))
    ids.user.set(String(r.id), id)
    await upsert(
      'users',
      {
        id,
        name: fit(r.name, 120, `user ${r.email} name`),
        title: r.title ?? null,
        bio: r.bio ?? null,
        email: r.email,
        password_hash: NO_PASSWORD,
        role: ['super_admin', 'admin'].includes(String(r.roleKey)) ? 'admin' : 'editor',
        active: r.isActive ? 1 : 0,
        created_at: utc(r.createdAt),
        updated_at: utc(r.updatedAt),
      },
      ['password_hash'], // a reset done after the first run must survive the next one
    )
    const now = await queryOne<Row>('SELECT password_hash FROM users WHERE id = ?', [id])
    if (now && String(now.password_hash) === NO_PASSWORD) needsReset.push(`${r.email} (${r.roleKey})`)
    t.imported++
  }
}

async function linkAvatars() {
  for (const r of await S('SELECT id, avatarId FROM `User` WHERE avatarId IS NOT NULL')) {
    const target = user(r.id)
    const avatar = mediaRef(r.avatarId)
    if (target && avatar) await execute('UPDATE users SET avatar_id = COALESCE(avatar_id, ?) WHERE id = ?', [avatar, target])
  }
}

/* ------------------------------------------------------------------ */
/* Media                                                                */
/* ------------------------------------------------------------------ */

const EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
}

async function sourceBytes(r: Row): Promise<Buffer | null> {
  try {
    if (r.provider === 'LOCAL') return await readFile(join(SOURCE_ROOT, 'storage', 'uploads', ...String(r.storageKey).split('/')))
    if (r.provider === 'STATIC') return await readFile(join(SOURCE_ROOT, 'public', ...String(r.url).split('/').filter(Boolean)))
    const res = await fetch(String(r.url))
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function importMedia() {
  const t = tally('media')
  const { rows, deleted } = await live('Media')
  t.source = rows.length
  if (deleted) warn(`media: ${deleted} soft-deleted rows not migrated`)
  await mkdir(uploadRoot, { recursive: true })

  for (const r of rows) {
    const id = uid('media', String(r.id))
    const fallback = extname(String(r.filename)).toLowerCase()
    const ext = EXTENSIONS[String(r.mimeType)] ?? (/^\.[a-z0-9]{1,5}$/.test(fallback) ? fallback : '')
    const name = `${id}${ext}`
    const target = join(uploadRoot, name)

    let size = Number(r.size) || 0
    let width = r.width === null ? null : Number(r.width)
    let height = r.height === null ? null : Number(r.height)

    if (!(await exists(target))) {
      const bytes = await sourceBytes(r)
      if (!bytes) {
        // Keep an earlier run's row linked rather than blanking every cover that uses it.
        const earlier = await queryOne<Row>('SELECT url FROM media WHERE id = ?', [id])
        if (earlier) {
          mediaMap.set(String(r.id), id)
          urlMap.set(String(r.url), String(earlier.url))
          if (r.provider === 'LOCAL') urlMap.set(`/uploads/${r.storageKey}`, String(earlier.url))
        }
        t.skipped++
        warn(`media ${r.id} (${r.provider} ${r.url}): source file not found, not migrated${earlier ? ' (row from an earlier run kept)' : ''}`)
        continue
      }
      await writeFile(target, bytes)
    }
    const bytes = await readFile(target)
    size = bytes.length
    if (width === null || height === null) {
      const d = readDimensions(bytes)
      width = d.width ?? width
      height = d.height ?? height
    }

    const url = publicUrl(name)
    await upsert('media', {
      id,
      filename: fit(r.filename, 255, `media ${r.id} filename`),
      url,
      mime_type: r.mimeType,
      size,
      width,
      height,
      alt: fit(r.alt ?? '', 255, `media ${r.id} alt`),
      folder: r.folder ?? null,
      created_at: utc(r.createdAt),
      updated_at: utc(r.updatedAt),
      created_by: user(r.uploadedById),
      updated_by: user(r.uploadedById),
    })
    mediaMap.set(String(r.id), id)
    urlMap.set(String(r.url), url)
    if (r.provider === 'LOCAL') urlMap.set(`/uploads/${r.storageKey}`, url)
    t.imported++
  }
}

/* ------------------------------------------------------------------ */
/* Taxonomy                                                             */
/* ------------------------------------------------------------------ */

/** Reads the source categories so content can be filed under their slugs; nothing is written. */
async function loadCategories() {
  const rows = await S('SELECT id, type, slug FROM `Category`')
  for (const r of rows) sourceCategory.set(String(r.id), { type: lower(r.type), slug: String(r.slug) })
}

async function importTags() {
  const t = tally('tags')
  const rows = await S('SELECT * FROM `Tag`')
  t.source = rows.length
  for (const r of rows) {
    const name = fit(r.name, 60, `tag ${r.slug} name`)!
    const slug = fit(r.slug, 60, `tag ${r.slug} slug`)!
    const existing = await queryOne<Row>('SELECT id FROM tags WHERE slug = ? OR name = ? LIMIT 1', [slug, name])
    const id = existing ? String(existing.id) : uid('tags', String(r.id))
    if (!existing) await upsert('tags', { id, name, slug, created_at: utc(r.createdAt) })
    ids.tag.set(String(r.id), id)
    t.imported++
  }
}

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

async function tagsOf(join_: string, key: string, id: unknown): Promise<string[]> {
  const rows = await src.query(`SELECT tagId FROM \`${join_}\` WHERE ${key} = ?`, [id])
  return (rows[0] as Row[]).map((r) => String(r.tagId))
}

async function importCaseStudies() {
  const t = tally('case_studies')
  const { rows, deleted } = await live('CaseStudy')
  t.source = rows.length
  if (deleted) warn(`case studies: ${deleted} soft-deleted rows not migrated`)
  for (const r of rows) {
    const w = `case study ${r.slug}`
    const id = await idFor('case_studies', String(r.id), { slug: r.slug })
    dropped(w, { gallery: r.gallery, focusKeyword: r.focusKeyword, tags: (await tagsOf('CaseStudyTag', 'caseStudyId', r.id)).length })
    await upsert('case_studies', {
      id,
      title: r.title,
      slug: r.slug,
      client: r.client ?? '',
      industry: r.industry ?? '',
      excerpt: fit(r.excerpt ?? '', 320, `${w} excerpt`),
      overview: rewriteHtml(r.overview, w),
      challenge: rewriteHtml(r.challenge, w),
      approach: rewriteHtml(r.approach, w),
      solution: rewriteHtml(r.solution, w),
      implementation: rewriteHtml(r.implementation, w),
      results: jsonList(r.results),
      technologies: jsonList(r.technologies),
      duration: r.duration,
      testimonial_text: fit(r.testimonialText, 1000, `${w} testimonialText`),
      testimonial_name: r.testimonialName,
      testimonial_role: r.testimonialRole,
      icon: r.icon,
      cover_image_id: mediaRef(r.coverId),
      service_slug: serviceSlug(r.serviceSlug, w),
      category: category(r.categoryId, CASE_STUDY_CATEGORIES, w),
      sort_order: Number(r.sortOrder ?? 0),
      views: Number(r.views ?? 0),
      ...publishing(r),
      ...seo(r, w),
      ...authorship(r),
    })
    ids.case_study.set(String(r.id), id)
    t.imported++
  }
}

async function importBlogs() {
  const t = tally('blogs')
  const { rows, deleted } = await live('Blog')
  t.source = rows.length
  if (deleted) warn(`blogs: ${deleted} soft-deleted rows not migrated`)
  for (const r of rows) {
    const w = `blog ${r.slug}`
    const id = await idFor('blogs', String(r.id), { slug: r.slug })
    const keywords = String(r.focusKeyword ?? '')
      .split(',')
      .map((k) => k.trim().slice(0, 60))
      .filter(Boolean)
    await upsert('blogs', {
      id,
      title: r.title,
      slug: r.slug,
      author_id: user(r.authorId),
      category: category(r.categoryId, BLOG_CATEGORIES, w),
      related_service: serviceSlug(r.relatedService, w),
      cover_image_id: mediaRef(r.coverId),
      excerpt: fit(r.excerpt ?? '', 320, `${w} excerpt`),
      body: rewriteHtml(r.contentHtml, w) ?? '',
      read_minutes: Number(r.readMinutes ?? 1),
      views: Number(r.views ?? 0),
      ...publishing(r),
      ...seo(r, w),
      meta_keywords: JSON.stringify(keywords),
      ...authorship(r),
    })
    // Tags: replaced wholesale, so a re-run leaves exactly the source's set.
    await execute('DELETE FROM blog_tags WHERE blog_id = ?', [id])
    const tagIds = (await tagsOf('BlogTag', 'blogId', r.id)).map((tid) => ids.tag.get(tid)).filter(Boolean) as string[]
    let position = 0
    for (const tagId of tagIds) {
      await execute('INSERT IGNORE INTO blog_tags (blog_id, tag_id, position) VALUES (?, ?, ?)', [id, tagId, position++])
    }
    tally('blog_tags').source += tagIds.length
    tally('blog_tags').imported += tagIds.length
    ids.blog.set(String(r.id), id)
    t.imported++
  }
}

async function importPortfolio() {
  const t = tally('portfolio')
  const { rows, deleted } = await live('Portfolio')
  t.source = rows.length
  if (deleted) warn(`portfolio: ${deleted} soft-deleted rows not migrated`)
  for (const r of rows) {
    const w = `portfolio ${r.slug}`
    const id = await idFor('portfolio', String(r.id), { slug: r.slug })
    dropped(w, { gallery: r.gallery, focusKeyword: r.focusKeyword, tags: (await tagsOf('PortfolioTag', 'portfolioId', r.id)).length })
    await upsert('portfolio', {
      id,
      title: r.title,
      slug: r.slug,
      client: r.client,
      industry: r.industry,
      summary: fit(r.summary ?? '', 320, `${w} summary`),
      description: rewriteHtml(r.description, w),
      technologies: jsonList(r.technologies),
      results: jsonList(r.results),
      team: jsonList(r.team),
      project_url: fit(r.projectUrl, 500, `${w} projectUrl`),
      github_url: fit(r.githubUrl, 500, `${w} githubUrl`),
      duration: r.duration,
      icon: r.icon,
      cover_image_id: mediaRef(r.coverId),
      featured: r.featured ? 1 : 0,
      state: r.state === 'ARCHIVED' ? 'inactive' : 'active',
      case_study_id: r.caseStudyId ? (ids.case_study.get(String(r.caseStudyId)) ?? null) : null,
      category: category(r.categoryId, PORTFOLIO_CATEGORIES, w),
      sort_order: Number(r.sortOrder ?? 0),
      ...publishing(r),
      ...seo(r, w),
      ...authorship(r),
    })
    ids.portfolio.set(String(r.id), id)
    t.imported++
  }
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** Zaavi files a FAQ under free text; here it is a faq_categories row (General when empty). */
async function faqCategory(name: unknown): Promise<string> {
  const label = String(name ?? '').trim() || 'General'
  const slug = slugify(label).slice(0, 80) || 'general'
  const found = await queryOne<Row>('SELECT id FROM faq_categories WHERE slug = ? OR LOWER(name) = LOWER(?) LIMIT 1', [slug, label])
  if (found) return String(found.id)
  const id = uid('faq_categories', slug)
  const order = await queryOne<Row>('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM faq_categories')
  await upsert('faq_categories', {
    id,
    name: label.slice(0, 80),
    slug,
    sort_order: Number(order?.n ?? 1),
    active: 1,
    created_at: new Date(),
    updated_at: new Date(),
  })
  tally('faq_categories (created)').imported++
  return id
}

async function importFaqs() {
  const t = tally('faqs')
  const { rows, deleted } = await live('Faq')
  t.source = rows.length
  if (deleted) warn(`faqs: ${deleted} soft-deleted rows not migrated`)
  for (const r of rows) {
    const id = uid('faqs', String(r.id))
    // FAQs here are published / draft / review only, with no schedule.
    const status = r.status === 'PUBLISHED' ? 'published' : 'draft'
    if (r.status === 'SCHEDULED' || r.status === 'ARCHIVED') warn(`faq ${r.id}: status ${r.status} imported as draft`)
    await upsert('faqs', {
      id,
      question: r.question,
      answer: rewriteHtml(r.answer, `faq ${r.id}`) ?? '',
      category_id: await faqCategory(r.category),
      sort_order: Number(r.sortOrder ?? 0),
      featured: r.showOnHome ? 1 : 0,
      status,
      ...authorship(r),
    })
    ids.faq.set(String(r.id), id)
    t.imported++
  }
}

async function importJobs() {
  const t = tally('jobs')
  const { rows, deleted } = await live('Job')
  t.source = rows.length
  if (deleted) warn(`jobs: ${deleted} soft-deleted rows not migrated`)
  for (const r of rows) {
    const w = `job ${r.slug}`
    const id = await idFor('jobs', String(r.id), { slug: r.slug })
    dropped(w, { focusKeyword: r.focusKeyword })
    await upsert('jobs', {
      id,
      title: r.title,
      slug: r.slug,
      department: r.department,
      location: r.location,
      employment_type: lower(r.employmentType),
      work_mode: lower(r.workMode),
      experience: r.experience,
      salary: r.salary,
      summary: fit(r.summary ?? '', 320, `${w} summary`),
      description: rewriteHtml(r.description, w),
      responsibilities: jsonList(r.responsibilities),
      requirements: jsonList(r.requirements),
      benefits: jsonList(r.benefits),
      closing_date: r.closingDate ? String(r.closingDate).slice(0, 10) : null,
      sort_order: Number(r.sortOrder ?? 0),
      ...publishing(r),
      ...seo(r, w),
      ...authorship(r),
    })
    ids.job.set(String(r.id), id)
    t.imported++
  }
}

async function importApplications() {
  const t = tally('job_applications')
  const rows = await S('SELECT * FROM `JobApplication`')
  t.source = rows.length
  for (const r of rows) {
    const id = uid('job_applications', String(r.id))
    const key = String(r.cvKey)
    const from = join(SOURCE_ROOT, 'storage', 'applications', ...key.split('/'))
    const to = join(PRIVATE_ROOT, ...key.split('/'))
    if (!/^\d{4}\/\d{2}\/[a-f0-9]{32}\.(pdf|docx|doc)$/.test(key)) {
      warn(`application ${r.id}: CV key "${key}" not in the expected shape; the CV will not download`)
    } else if (!(await exists(to))) {
      if (await exists(from)) {
        await mkdir(dirname(to), { recursive: true })
        await copyFile(from, to)
      } else {
        warn(`application ${r.id} (${r.email}): CV file missing in Zaavi storage; row imported without it`)
      }
    }
    await upsert('job_applications', {
      id,
      job_id: r.jobId ? (ids.job.get(String(r.jobId)) ?? null) : null,
      job_title: r.jobTitle,
      name: r.name,
      email: fit(r.email, 190, `application ${r.id} email`),
      phone: r.phone,
      location: r.location,
      linkedin_url: r.linkedinUrl,
      portfolio_url: r.portfolioUrl,
      cover_letter: r.coverLetter,
      cv_key: key,
      cv_filename: r.cvFilename,
      cv_mime: r.cvMime,
      cv_size: Number(r.cvSize ?? 0),
      status: lower(r.status),
      notes: r.notes,
      ip: fit(r.ip, 45, `application ${r.id} ip`),
      user_agent: r.userAgent,
      created_at: utc(r.createdAt),
      updated_at: utc(r.updatedAt),
    })
    t.imported++
  }
}

async function importEnquiries() {
  const t = tally('enquiries')
  const rows = await S('SELECT * FROM `ContactInquiry`')
  t.source = rows.length
  for (const r of rows) {
    const id = uid('enquiries', String(r.id))
    await upsert('enquiries', {
      id,
      name: r.name,
      phone: r.phone,
      company: r.company,
      service: r.service,
      subject: r.subject,
      email: fit(r.email, 190, `enquiry ${r.id} email`),
      ip: fit(r.ip, 45, `enquiry ${r.id} ip`),
      user_agent: r.userAgent,
      message: r.message,
      status: lower(r.status),
      assignee_id: user(r.assignedToId),
      created_at: utc(r.createdAt),
      updated_at: utc(r.updatedAt),
    })
    // Zaavi keeps one free-text notes field; here it becomes one note.
    const noteId = uid('enquiry_notes', String(r.id))
    if (r.notes && String(r.notes).trim()) {
      await upsert('enquiry_notes', {
        id: noteId,
        enquiry_id: id,
        author: (r.assignedToId && userName.get(String(r.assignedToId))) || 'Imported from Zaavi CMS',
        body: r.notes,
        created_at: utc(r.updatedAt),
      })
      tally('enquiry_notes').imported++
    } else {
      await execute('DELETE FROM enquiry_notes WHERE id = ?', [noteId])
    }
    t.imported++
  }
}

/* ------------------------------------------------------------------ */
/* Settings, redirects, analytics                                       */
/* ------------------------------------------------------------------ */

async function importSettings() {
  const t = tally('settings groups')
  const rows = await S('SELECT `key`, value FROM `Setting`')
  t.source = rows.length
  const byKey = new Map(rows.map((r) => [String(r.key), (parseJson(r.value) ?? {}) as Record<string, unknown>]))
  const pick = (o: Record<string, unknown> | undefined, keys: string[]) =>
    Object.fromEntries(keys.filter((k) => o && k in o).map((k) => [k, o![k]]))

  const general = pick(byKey.get('general'), ['siteName', 'tagline', 'contactEmail', 'phone', 'address', 'city', 'hours', 'responseTime'])
  const social = pick(byKey.get('social'), ['linkedin', 'facebook', 'x', 'youtube', 'instagram'])
  const seoGroup = pick(byKey.get('seo'), ['defaultTitle', 'defaultDescription', 'allowIndexing'])
  const mail = byKey.get('email') ?? {}
  const alert = String(mail.notificationEmail ?? mail.alertEmail ?? '').trim()
  const email: Record<string, unknown> = {
    alertEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alert) ? alert : '',
    sendInquiryAlerts: mail.sendInquiryAlerts ?? true,
    sendApplicationAlerts: mail.sendApplicationAlerts ?? true,
  }
  if (alert && !email.alertEmail) warn(`settings.email.notificationEmail "${alert}" is not an email address; alertEmail left empty`)
  dropped('settings.general', { logoId: byKey.get('general')?.logoId, faviconId: byKey.get('general')?.faviconId })
  dropped('settings.seo', { defaultOgImageId: byKey.get('seo')?.defaultOgImageId })
  if (byKey.has('security')) warn('settings.security: not migrated (session/lockout policy is configured in .env / code here)')

  const current = await queryOne<Row>('SELECT general, social, seo, email FROM settings WHERE id = 1')
  const merged = (group: string, values: Record<string, unknown>) =>
    JSON.stringify({ ...((parseJson(current?.[group]) ?? {}) as object), ...values })
  await upsert('settings', {
    id: 1,
    general: merged('general', general),
    social: merged('social', social),
    seo: merged('seo', seoGroup),
    email: merged('email', email),
    created_at: new Date(),
    updated_at: new Date(),
  }, ['created_at'])
  t.imported = ['general', 'social', 'seo', 'email'].filter((k) => byKey.has(k)).length
}

const typeMap: Record<string, Map<string, string>> = {
  blog: ids.blog,
  case_study: ids.case_study,
  portfolio: ids.portfolio,
  job: ids.job,
}

async function importSlugRedirects() {
  const t = tally('slug_redirects')
  const rows = await S('SELECT * FROM `SlugRedirect`')
  t.source = rows.length
  for (const r of rows) {
    const type = String(r.type)
    const target = typeMap[type]?.get(String(r.targetId))
    if (!['blog', 'case_study', 'portfolio', 'job'].includes(type) || !target) {
      t.skipped++
      warn(`slug redirect ${type}/${r.fromSlug}: target not migrated, skipped`)
      continue
    }
    await upsert('slug_redirects', {
      id: uid('slug_redirects', String(r.id)),
      type,
      from_slug: r.fromSlug,
      target_id: target,
      created_at: utc(r.createdAt),
    })
    t.imported++
  }
}

async function importPageViews() {
  const t = tally('page_views')
  const rows = await S('SELECT * FROM `PageView`')
  t.source = rows.length
  for (const r of rows) {
    const type = r.contentType ? String(r.contentType) : null
    const contentId = type && r.contentId ? (typeMap[type]?.get(String(r.contentId)) ?? null) : null
    // Keyed on (path, day). GREATEST keeps a re-run from adding the same views twice,
    // and leaves alone a day the new site has already counted past.
    await execute(
      `INSERT INTO page_views (id, path, day, count, content_type, content_id) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE count = GREATEST(count, VALUES(count)),
         content_type = COALESCE(VALUES(content_type), content_type), content_id = COALESCE(VALUES(content_id), content_id)`,
      [uid('page_views', String(r.id)), fit(r.path, 200, `page view ${r.path}`), String(r.day).slice(0, 10), Number(r.count ?? 0), type, contentId],
    )
    t.imported++
  }
}

/* ------------------------------------------------------------------ */
/* Run                                                                  */
/* ------------------------------------------------------------------ */

try {
  console.log(`Importing ${SOURCE_DB} (files from ${SOURCE_ROOT}) → ${config.DB_NAME}`)
  console.log(`  uploads → ${uploadRoot}\n  CVs     → ${PRIVATE_ROOT}\n`)

  await importUsers()
  await importMedia()
  await linkAvatars()
  await loadCategories()
  await importTags()
  await importCaseStudies()
  await importBlogs()
  await importPortfolio()
  await importFaqs()
  await importJobs()
  await importApplications()
  await importEnquiries()
  await importSettings()
  await importSlugRedirects()
  await importPageViews()

  console.log('type'.padEnd(26), 'source'.padStart(7), 'imported'.padStart(9), 'skipped'.padStart(8))
  for (const [type, s] of Object.entries(stats)) {
    console.log(type.padEnd(26), String(s.source).padStart(7), String(s.imported).padStart(9), String(s.skipped).padStart(8))
  }
  console.log('\nNot migrated by design: activity log, notifications, sessions, password reset tokens, roles/permissions,')
  console.log('services, projects, pages and categories (fixed in code here; see src/modules/shared/taxonomy.ts).')
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
  console.log(
    needsReset.length
      ? `\nUsers created without a usable password — set one from Users in the CMS (or "forgot password"):\n${needsReset.map((u) => `  - ${u}`).join('\n')}`
      : '\nNo users need a password reset (existing accounts kept their own login).',
  )
} finally {
  await src.end()
  await pool.end()
}

