import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { config } from './config.js'
import { errorHandler } from './http/errors.js'
import { revalidateSite } from './http/revalidate.js'
import { auditTrail } from './middleware/audit.js'
import { attachUser } from './middleware/auth.js'
import { activityRouter } from './modules/activity/activity.routes.js'
import { analyticsRouter } from './modules/analytics/analytics.routes.js'
import { applicationsRouter } from './modules/applications/applications.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { blogsRouter } from './modules/blogs/blogs.routes.js'
import { caseStudiesRouter } from './modules/case_studies/case_studies.routes.js'
import { dashboardRouter, searchRouter } from './modules/dashboard/dashboard.routes.js'
import { enquiriesRouter } from './modules/enquiries/enquiries.routes.js'
import { faqCategoriesRouter } from './modules/faq_categories/faq_categories.routes.js'
import { faqsRouter } from './modules/faqs/faqs.routes.js'
import { jobsRouter } from './modules/jobs/jobs.routes.js'
import { mediaRouter } from './modules/media/media.routes.js'
import { UPLOAD_URL_PREFIX, uploadRoot } from './modules/media/storage.js'
import { portfolioRouter } from './modules/portfolio/portfolio.routes.js'
import { publicRouter } from './modules/public/public.routes.js'
import { redirectsRouter } from './modules/seo/seo.routes.js'
import { settingsRouter } from './modules/settings/settings.routes.js'
import { tagsRouter } from './modules/tags/tags.routes.js'
import { testimonialsRouter } from './modules/testimonials/testimonials.routes.js'
import { usersRouter } from './modules/users/users.routes.js'

export function createApp() {
  const app = express()

  // Two reverse proxies sit in front of this container in production:
  // Coolify's Traefik ingress, then this app's own nginx (cms-frontend),
  // which proxy_passes /api to here. trust proxy must count both hops, or
  // req.ip resolves to nginx's fixed upstream address instead of the real
  // visitor — collapsing every visitor into one IP for rate limiting (this
  // broke login: the 10/15min limiter tripped for everyone, not per-client)
  // and for Secure-cookie / X-Forwarded-Proto handling.
  app.set('trust proxy', 2)

  app.use(helmet())

  // Names the CMS on every response, so the website can tell this API from
  // another one answering on the same shared network alias (see CMS_SITE).
  app.use((_req, res, next) => {
    res.setHeader('X-CMS-Site', config.CMS_SITE)
    next()
  })

  // An explicit origin, not '*': browsers refuse to send credentials to a
  // wildcard, and the session cookie is the whole auth mechanism.
  app.use(
    cors({
      origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '2mb' }))
  app.use(cookieParser(config.COOKIE_SECRET))

  /**
   * Uploaded files.
   *
   * Served with their own headers rather than inheriting the app's: an SVG is
   * markup, so one uploaded with a <script> inside would run if a browser
   * opened it directly on this origin. The empty CSP stops that, and nosniff
   * stops a mislabelled file being reinterpreted as something executable.
   *
   * CVs are not here: they live under PRIVATE_DIR, which nothing serves.
   */
  app.use(
    UPLOAD_URL_PREFIX,
    express.static(uploadRoot, {
      index: false,
      // The stored names are random and immutable, so they can cache hard.
      maxAge: '365d',
      setHeaders: (res) => {
        res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox")
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      },
    }),
  )

  // Resolves req.user when a session cookie is present; never rejects.
  app.use(attachUser)

  // Pings the website's cache after a successful content change. Runs after
  // the response, so it can neither slow a save nor fail one.
  app.use(revalidateSite)

  /*
    Records who changed what, for every module below.

    After `attachUser`, because it needs to know who; before the routers, so
    it wraps them all. A module cannot opt out or forget — which is the point,
    since a module that forgets makes the contribution figures quietly wrong
    rather than loudly broken.
  */
  app.use(auditTrail)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', env: config.NODE_ENV, site: config.CMS_SITE })
  })

  app.use('/api/activity', activityRouter)
  app.use('/api/analytics', analyticsRouter)
  app.use('/api/applications', applicationsRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/blogs', blogsRouter)
  app.use('/api/case-studies', caseStudiesRouter)
  app.use('/api/dashboard', dashboardRouter)
  app.use('/api/enquiries', enquiriesRouter)
  app.use('/api/faq-categories', faqCategoriesRouter)
  app.use('/api/faqs', faqsRouter)
  app.use('/api/jobs', jobsRouter)
  app.use('/api/media', mediaRouter)
  app.use('/api/portfolio', portfolioRouter)

  // No session required — see the note in public.routes.ts.
  app.use('/api/public', publicRouter)
  app.use('/api/redirects', redirectsRouter)
  app.use('/api/search', searchRouter)
  app.use('/api/settings', settingsRouter)
  app.use('/api/tags', tagsRouter)
  app.use('/api/testimonials', testimonialsRouter)
  app.use('/api/users', usersRouter)

  app.use((_req, res) => {
    res.status(404).json({ message: 'Endpoint not found.' })
  })

  // Must be last — Express identifies error middleware by its arity.
  app.use(errorHandler)

  return app
}
