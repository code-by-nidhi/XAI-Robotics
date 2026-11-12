import { Router, type ErrorRequestHandler, type Request, type Response } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import multer, { MulterError } from 'multer'
import { z } from 'zod'

import { alertNewApplication, alertNewEnquiry } from '../../mail/alerts.js'
import { query, type Row } from '../../db/pool.js'
import { asyncHandler, HttpError, notFound, unprocessable } from '../../http/errors.js'
import * as analyticsRepo from '../analytics/analytics.repo.js'
import * as applicationsRepo from '../applications/applications.repo.js'
import { publicApplicationSchema } from '../applications/applications.schema.js'
import { CV_MAX_BYTES, saveCv } from '../applications/cv-storage.js'
import * as blogsRepo from '../blogs/blogs.repo.js'
import * as caseStudiesRepo from '../case_studies/case_studies.repo.js'
import * as enquiriesRepo from '../enquiries/enquiries.repo.js'
import { publicEnquirySchema } from '../enquiries/enquiries.schema.js'
import * as faqCategoriesRepo from '../faq_categories/faq_categories.repo.js'
import * as faqsRepo from '../faqs/faqs.repo.js'
import * as jobsRepo from '../jobs/jobs.repo.js'
import * as portfolioRepo from '../portfolio/portfolio.repo.js'
import * as settingsRepo from '../settings/settings.repo.js'
import { liveSql, releaseDueContent } from '../shared/publishing.js'

/**
 * What the public website may read and write.
 *
 * Deliberately a separate router with no `requireAuth`: every other module is
 * behind a session, and mounting public access on those would be one forgotten
 * middleware away from exposing drafts and enquiry records.
 *
 * Two rules hold everywhere below:
 *   - visibility is decided here, by each type's own rule (liveSql and
 *     friends), never by anything in the query string — a crafted request
 *     cannot read a draft;
 *   - nothing accepts an id from the caller; lookups are by slug.
 *
 * Old slugs: a detail endpoint asked for a renamed item answers
 *   301  { "redirect": "<current-slug>" }
 * with no Location header, so fetch() hands the answer to the website instead
 * of silently following it — the site decides the URL to send the visitor to.
 */
export const publicRouter = Router()

// Due scheduled items become "published" before anything is read (throttled).
publicRouter.use(
  asyncHandler(async (_req, _res, next) => {
    await releaseDueContent()
    next()
  }),
)

const MAX_PAGE_SIZE = 100

/** `?page=` / `?pageSize=` (or the older `?limit=`), bounded. */
function paging(req: Request, fallback = 12): { page: number; pageSize: number } {
  const page = Math.floor(Number(req.query.page))
  const size = Math.floor(Number(req.query.pageSize ?? req.query.limit))
  return {
    page: Number.isFinite(page) && page >= 1 ? page : 1,
    pageSize: Number.isFinite(size) && size >= 1 ? Math.min(size, MAX_PAGE_SIZE) : fallback,
  }
}

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, 160) : undefined
const flag = (value: unknown) => value === '1' || value === 'true'

/** A detail answer: the item, a redirect for an old slug, or 404. */
function sendDetail(
  res: Response,
  result: { item: unknown } | { redirect: string } | null,
  what: string,
): void {
  if (!result) throw notFound(what)
  if ('redirect' in result) {
    res.status(301).json({ redirect: result.redirect })
    return
  }
  res.json(result.item)
}

/* ------------------------------------------------------------------ */
/* Site                                                                 */
/* ------------------------------------------------------------------ */

/** Business details, social links and SEO defaults — never the alert address. */
publicRouter.get(
  '/site',
  asyncHandler(async (_req, res) => {
    res.json(await settingsRepo.publicSite())
  }),
)

/* ------------------------------------------------------------------ */
/* Blog                                                                 */
/* ------------------------------------------------------------------ */

publicRouter.get(
  '/blogs',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paging(req)
    const result = await blogsRepo.publicList({
      page,
      pageSize,
      category: str(req.query.category),
      tag: str(req.query.tag),
    })
    res.json({ ...result, page, pageSize })
  }),
)

publicRouter.get(
  '/blogs/:slug',
  asyncHandler(async (req, res) => {
    sendDetail(res, await blogsRepo.publicGet(String(req.params.slug)), 'Post')
  }),
)

/**
 * Tags that have at least one public post, with their counts.
 *
 * Only public: a tag whose every post is a draft would render a page with
 * nothing on it, reachable from a tag cloud that promised otherwise.
 */
publicRouter.get(
  '/tags',
  asyncHandler(async (_req, res) => {
    const rows = await query<Row>(
      `SELECT t.name, t.slug, COUNT(b.id) AS uses
         FROM tags t
         JOIN blog_tags bt ON bt.tag_id = t.id
         JOIN blogs b ON b.id = bt.blog_id AND ${liveSql('b')}
        GROUP BY t.id, t.name, t.slug
        ORDER BY uses DESC, t.name ASC`,
    )
    const items = rows.map((row) => ({ name: row.name, slug: row.slug, uses: Number(row.uses ?? 0) }))
    res.json({ items, total: items.length })
  }),
)

/* ------------------------------------------------------------------ */
/* Work: case studies, portfolio                                      */
/* ------------------------------------------------------------------ */

publicRouter.get(
  '/case-studies',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paging(req, 50)
    const result = await caseStudiesRepo.publicList({ page, pageSize, industry: str(req.query.industry) })
    res.json({ ...result, page, pageSize })
  }),
)

publicRouter.get(
  '/case-studies/:slug',
  asyncHandler(async (req, res) => {
    sendDetail(res, await caseStudiesRepo.publicGet(String(req.params.slug)), 'Case study')
  }),
)

publicRouter.get(
  '/portfolio',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paging(req, 50)
    const result = await portfolioRepo.publicList({
      page,
      pageSize,
      category: str(req.query.category),
      featured: flag(req.query.featured),
    })
    res.json({ ...result, page, pageSize })
  }),
)

publicRouter.get(
  '/portfolio/:slug',
  asyncHandler(async (req, res) => {
    sendDetail(res, await portfolioRepo.publicGet(String(req.params.slug)), 'Portfolio item')
  }),
)

/* ------------------------------------------------------------------ */
/* FAQs                                                                 */
/* ------------------------------------------------------------------ */

/** `?homeOnly=1` for the homepage's short list; `?category=` by slug or name. */
publicRouter.get(
  '/faqs',
  asyncHandler(async (req, res) => {
    const items = await faqsRepo.publicList({ homeOnly: flag(req.query.homeOnly), category: str(req.query.category) })
    res.json({ items, total: items.length })
  }),
)

/** Active categories with their published questions inside, for a tabbed page. */
publicRouter.get(
  '/faq-categories',
  asyncHandler(async (_req, res) => {
    const items = await faqCategoriesRepo.publicTree()
    res.json({ items, total: items.length })
  }),
)

/* ------------------------------------------------------------------ */
/* Careers                                                              */
/* ------------------------------------------------------------------ */

publicRouter.get(
  '/jobs',
  asyncHandler(async (_req, res) => {
    const items = await jobsRepo.publicList()
    res.json({ items, total: items.length })
  }),
)

publicRouter.get(
  '/jobs/:slug',
  asyncHandler(async (req, res) => {
    sendDetail(res, await jobsRepo.publicGet(String(req.params.slug)), 'Job opening')
  }),
)

/** Several applications from one address in half an hour is a script, not a job hunt. */
const applyLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "You've sent several applications in a short time. Please wait a little and try again." },
})

/**
 * The CV is buffered in memory, bounded by the size limit, because it has to
 * be checked by its content before anything is written to disk.
 */
const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CV_MAX_BYTES, files: 1, fields: 20, fieldSize: 20_000 },
})

/**
 * An application to an open job.
 *
 * multipart/form-data: name, email, phone?, location?, linkedinUrl?,
 * portfolioUrl?, coverLetter?, website (honeypot), and the file as `cv`.
 */
publicRouter.post(
  '/jobs/:slug/apply',
  applyLimiter,
  cvUpload.single('cv'),
  asyncHandler(async (req, res) => {
    const job = await jobsRepo.openJob(String(req.params.slug))
    if (!job) throw notFound('Job opening')

    const input = publicApplicationSchema.parse(req.body ?? {})

    // A bot that filled the hidden field gets the same answer as a person, so
    // it learns nothing; nothing is stored.
    if (input.website) {
      res.status(201).json({ ok: true })
      return
    }

    // Checked before the file is stored, so a repeat leaves nothing behind.
    if (await applicationsRepo.hasApplied(job.id, input.email)) {
      const message = 'You have already applied for this role. We will be in touch about your application.'
      throw new HttpError(409, message, { email: message })
    }

    const cv = await saveCv(req.file)
    const created = await applicationsRepo.createFromWebsite(job, input, cv, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    alertNewApplication({
      id: created.id,
      jobTitle: job.title,
      name: input.name,
      email: input.email,
      phone: input.phone,
      location: input.location,
    })

    // Not the record: an application is not the applicant's to read back.
    res.status(201).json({ ok: true })
  }),
)

/** Multer's own limits, in the words the form shows. */
const cvErrors: ErrorRequestHandler = (error, _req, _res, next) => {
  if (error instanceof MulterError) {
    next(
      error.code === 'LIMIT_FILE_SIZE'
        ? unprocessable({ cv: 'Your resume must be 5 MB or smaller.' })
        : unprocessable({ cv: 'Attach one resume file.' }),
    )
    return
  }
  next(error)
}
publicRouter.use('/jobs', cvErrors)

/* ------------------------------------------------------------------ */
/* Contact form                                                         */
/* ------------------------------------------------------------------ */

/**
 * Anyone on the internet can reach this, so it carries its own limit. Keyed by
 * the visitor's address — which is why the website should post the form from
 * the browser, or forward X-Forwarded-For if it proxies it.
 */
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "You've sent several messages in a short time. Please wait a few minutes and try again." },
})

/** Body: { name, email, phone?, company?, service?, message, website (honeypot) }. */
publicRouter.post(
  '/enquiries',
  enquiryLimiter,
  asyncHandler(async (req, res) => {
    const input = publicEnquirySchema.parse(req.body ?? {})

    // Honeypot and double-submit both get the ordinary success answer: the
    // bot learns nothing, and the person who clicked twice sees "sent".
    if (input.website || (await enquiriesRepo.isRecentDuplicate(input.email, input.message))) {
      res.status(201).json({ ok: true })
      return
    }

    const created = await enquiriesRepo.createFromWebsite(input, { ip: req.ip, userAgent: req.get('user-agent') })
    alertNewEnquiry({ id: created.id, ...input })

    // Deliberately not the record: an enquiry is not the submitter's to read back.
    res.status(201).json({ ok: true })
  }),
)

/* ------------------------------------------------------------------ */
/* Analytics beacon                                                     */
/* ------------------------------------------------------------------ */

/**
 * Two limits, and both answer 204 like success: a beacon that errored would be
 * retried or logged by the browser, and a visitor must never notice analytics.
 * One count per page per address per half hour stops a reload from counting
 * twice; 120 an hour per address caps a script.
 */
const silent = (_req: Request, res: Response) => {
  res.status(204).end()
}
const trackPerPage = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 1,
  standardHeaders: false,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const path = (req.body as { path?: unknown } | undefined)?.path
    return `${ipKeyGenerator(req.ip ?? '')}:${typeof path === 'string' ? path.slice(0, 200) : ''}`
  },
  handler: silent,
})
const trackPerAddress = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: false,
  legacyHeaders: false,
  handler: silent,
})

const trackSchema = z.object({ path: z.string().min(1).max(300) })

/** Body: { path: "/blog/some-post" }. Always 204. */
publicRouter.post('/track', trackPerAddress, trackPerPage, (req, res) => {
  const parsed = trackSchema.safeParse(req.body ?? {})
  res.status(204).end()
  // After the response: the visitor's browser never waits on the counter.
  if (parsed.success) void analyticsRepo.recordPageView(parsed.data.path)
})

/* ------------------------------------------------------------------ */
/* Redirects                                                            */
/* ------------------------------------------------------------------ */

const SLUG_TYPES = [
  { type: 'blog', table: 'blogs', prefix: '/blog/' },
  { type: 'case_study', table: 'case_studies', prefix: '/case-studies/' },
  { type: 'portfolio', table: 'portfolio', prefix: '/portfolio/' },
  { type: 'job', table: 'jobs', prefix: '/careers/' },
] as const

/**
 * Every redirect the website should apply.
 *
 * `items` are the hand-made path redirects from the SEO page; `slugs` are the
 * automatic old-slug ones, resolved to the item's current slug and only for
 * items that are still public — a redirect to a draft would be a redirect to a
 * 404.
 */
publicRouter.get(
  '/redirects',
  asyncHandler(async (_req, res) => {
    const rows = await query<Row>('SELECT from_path, to_path, type FROM redirects WHERE enabled = 1')

    const slugs: { type: string; from: string; to: string; fromPath: string; toPath: string }[] = []
    for (const { type, table, prefix } of SLUG_TYPES) {
      const found = await query<Row>(
        `SELECT r.from_slug, t.slug FROM slug_redirects r
           JOIN ${table} t ON t.id = r.target_id AND ${liveSql('t')}
          WHERE r.type = ?`,
        [type],
      )
      for (const row of found) {
        slugs.push({
          type,
          from: row.from_slug as string,
          to: row.slug as string,
          fromPath: `${prefix}${row.from_slug as string}`,
          toPath: `${prefix}${row.slug as string}`,
        })
      }
    }

    res.json({
      items: rows.map((row) => ({ from: row.from_path, to: row.to_path, type: Number(row.type) })),
      slugs,
    })
  }),
)
