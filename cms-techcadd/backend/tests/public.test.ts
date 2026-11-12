import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, pool, resetTables, startServer, stopServer, type Client } from './helpers.js'
import { publicEnquirySchema } from '../src/modules/enquiries/enquiries.schema.js'

/**
 * The website's side of the API.
 *
 * These are the promises the site is built on: nothing unpublished leaks, old
 * slugs keep working, and a visitor's submission is stored once and only once.
 * The public limits are per address and every test comes from 127.0.0.1, so
 * each form endpoint is called only a handful of times across this file.
 */
let api: Client
const visitor = client()

beforeAll(async () => {
  await startServer()
  api = client()
  await api.signIn()
})

afterAll(stopServer)

beforeEach(async () => {
  await resetTables(
    'page_views', 'slug_redirects', 'job_applications', 'jobs', 'portfolio',
    'case_studies', 'blogs', 'enquiries',
  )
})

const BODY = `<p>${'Plenty of words for a real article body here. '.repeat(4)}</p>`
const publishedPost = (slug: string, extra: Record<string, unknown> = {}) =>
  api.post('/blogs', { title: slug, slug, excerpt: 'An excerpt long enough to publish.', body: BODY, status: 'published', ...extra })

describe('visibility', () => {
  it('shows published content and hides drafts, archived and future-scheduled', async () => {
    await publishedPost('live')
    await api.post('/blogs', { title: 'Draft', slug: 'draft' })
    const archived = await publishedPost('archived')
    await api.patch(`/blogs/${archived.body.id}`, { status: 'archived' })
    await publishedPost('later', { status: 'scheduled', publishAt: new Date(Date.now() + 3_600_000).toISOString() })

    const { body } = await visitor.get('/public/blogs')
    expect(body.items.map((p: any) => p.slug)).toEqual(['live'])
    expect((await visitor.get('/public/blogs/draft')).status).toBe(404)
    expect((await visitor.get('/public/blogs/later')).status).toBe(404)
  })

  it('treats a scheduled item as public once its time has passed', async () => {
    const post = await publishedPost('due', { status: 'scheduled', publishAt: new Date(Date.now() + 3_600_000).toISOString() })
    await pool.query('UPDATE blogs SET publish_at = NOW(3) - INTERVAL 1 MINUTE WHERE id = ?', [post.body.id])
    expect((await visitor.get('/public/blogs/due')).status).toBe(200)
  })

  it('never exposes internal fields', async () => {
    await publishedPost('clean')
    const { body } = await visitor.get('/public/blogs/clean')
    for (const key of ['status', 'authorId', 'createdBy', 'updatedBy', 'views']) {
      expect(body, key).not.toHaveProperty(key)
    }
    expect(body.author?.name).toBeTruthy()
    expect(JSON.stringify(body)).not.toMatch(/@example\.com/)
  })

  it('shows a job only while it is open', async () => {
    const job = {
      title: 'Engineer', slug: 'engineer', summary: 'Build things with a small senior team.',
      responsibilities: ['Ship'], requirements: ['Python'], status: 'published',
    }
    await api.post('/jobs', job)
    await api.post('/jobs', { ...job, slug: 'closed', closingDate: '2000-01-01' })
    const { body } = await visitor.get('/public/jobs')
    expect(body.items.map((j: any) => j.slug)).toEqual(['engineer'])
  })

  it('links a portfolio item to its case study only while that is public', async () => {
    const study = await api.post('/case-studies', { title: 'Study', slug: 'study' })
    await api.post('/portfolio', {
      title: 'Piece', slug: 'piece', summary: 'A summary that is long enough.', category: 'robotic-arms',
      caseStudyId: study.body.id, status: 'published',
    })
    expect((await visitor.get('/public/portfolio/piece')).body.caseStudy).toBeNull()
  })

  it('names categories from the fixed list, as the website reads them', async () => {
    await publishedPost('filed', { category: 'robotics-engineering', relatedService: 'robotics-programme' })
    const post = (await visitor.get('/public/blogs/filed')).body
    expect(post.category).toEqual({ name: 'Robotics Engineering', slug: 'robotics-engineering' })
    expect(post.relatedService).toBe('robotics-programme')
    expect((await visitor.get('/public/blogs?category=robotics-engineering')).body.items.map((p: any) => p.slug)).toEqual(['filed'])
    // By name too, as before the categories were fixed.
    expect((await visitor.get('/public/blogs?category=Robotics%20Engineering')).body.total).toBe(1)

    await api.post('/portfolio', {
      title: 'Agent', slug: 'agent', summary: 'A summary that is long enough.', category: 'mobile-robots', status: 'published',
    })
    const list = (await visitor.get('/public/portfolio')).body
    expect(list.items[0].category).toEqual({ name: 'Mobile Robots & Rovers', slug: 'mobile-robots' })
    // Only categories something is filed under, in the list's order.
    expect(list.categories).toEqual([{ name: 'Mobile Robots & Rovers', slug: 'mobile-robots' }])
  })
})

describe('old slugs', () => {
  it('answer 301 with the current slug once content that was public is renamed', async () => {
    const post = await publishedPost('first-name')
    await api.patch(`/blogs/${post.body.id}`, { slug: 'second-name' })
    await api.patch(`/blogs/${post.body.id}`, { slug: 'third-name' })

    // Both old addresses land on the current one — no chain to follow.
    for (const old of ['first-name', 'second-name']) {
      const res = await visitor.get(`/public/blogs/${old}`)
      expect(res.status).toBe(301)
      expect(res.body).toEqual({ redirect: 'third-name' })
    }
  })

  it('are not recorded for drafts, and are released when the slug is reused', async () => {
    const draft = await api.post('/blogs', { title: 'D', slug: 'draft-a' })
    await api.patch(`/blogs/${draft.body.id}`, { slug: 'draft-b' })
    expect((await visitor.get('/public/blogs/draft-a')).status).toBe(404)

    const post = await publishedPost('reused')
    await api.patch(`/blogs/${post.body.id}`, { slug: 'moved' })
    await publishedPost('reused')
    expect((await visitor.get('/public/blogs/reused')).status).toBe(200)
  })
})

describe('contact form', () => {
  const form = {
    name: 'Ada Visitor', email: 'ada@example.com', company: 'Acme', service: 'ai-agents',
    message: 'We would like to discuss a project with you.', website: '',
  }

  it('stores a submission once, ignores the honeypot, and refuses bad input', async () => {
    expect((await visitor.post('/public/enquiries', form)).status).toBe(201)
    // A double click within ten minutes is accepted but not stored twice.
    expect((await visitor.post('/public/enquiries', form)).status).toBe(201)
    expect((await visitor.post('/public/enquiries', { ...form, message: 'Buy cheap things now!!', website: 'x' })).status).toBe(201)

    const bad = await visitor.post('/public/enquiries', { name: 'A', email: 'not-an-email', message: 'short' })
    expect(bad.status).toBe(422)
    expect(bad.body.fieldErrors?.email).toBeTruthy()

    const [rows] = await pool.query<any[]>('SELECT name, status, subject FROM enquiries')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ name: 'Ada Visitor', status: 'new', subject: 'Website enquiry from Acme' })
  })

  it('accepts the XAI Robotics form: who is writing, what they want, no message', async () => {
    const xai = {
      name: 'Grace Student', email: 'grace@example.com', phone: '+91 98765 43210',
      role: 'Student', service: '6-Month Programme', message: '', website: '',
    }
    expect((await visitor.post('/public/enquiries', xai)).status).toBe(201)

    // Checked on the schema: another POST here would trip the form's rate limit.
    expect(publicEnquirySchema.safeParse({ ...xai, message: 'hi' }).success).toBe(false)
    expect(publicEnquirySchema.safeParse({ name: xai.name, email: xai.email }).success).toBe(true)

    const [rows] = await pool.query<any[]>(
      "SELECT subject, service, message FROM enquiries WHERE email = 'grace@example.com'",
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ subject: 'Website enquiry · Student', service: '6-Month Programme', message: '' })
  })
})

describe('job applications', () => {
  const pdf = Buffer.from('%PDF-1.4\n%test\n%%EOF\n')

  function applicationForm(email: string, file: Buffer, name = 'cv.pdf') {
    const form = new FormData()
    form.append('name', 'Grace Applicant')
    form.append('email', email)
    form.append('cv', new Blob([file], { type: 'application/pdf' }), name)
    return form
  }

  it('stores the CV privately, once per person, and only serves it to an admin', async () => {
    await api.post('/jobs', {
      title: 'Engineer', slug: 'engineer', summary: 'Build things with a small senior team.',
      responsibilities: ['Ship'], requirements: ['Python'], status: 'published',
    })

    expect((await visitor.call('POST', '/public/jobs/engineer/apply', applicationForm('grace@example.com', pdf))).status).toBe(201)

    const again = await visitor.call('POST', '/public/jobs/engineer/apply', applicationForm('grace@example.com', pdf))
    expect(again.status).toBe(409)

    // Judged by content: a renamed executable is not a PDF.
    const fake = await visitor.call('POST', '/public/jobs/engineer/apply', applicationForm('mallory@example.com', Buffer.from('MZ\x90\x00 not a pdf')))
    expect(fake.status).toBe(422)
    expect(fake.body.fieldErrors?.cv).toBeTruthy()

    const [rows] = await pool.query<any[]>('SELECT id, cv_key, job_title FROM job_applications')
    expect(rows).toHaveLength(1)
    expect(rows[0].cv_key).toMatch(/^\d{4}\/\d{2}\/[a-f0-9]{32}\.pdf$/)
    expect(rows[0].job_title).toBe('Engineer')

    expect((await client().get(`/applications/${rows[0].id}/cv`)).status).toBe(401)
    const listed = await api.get('/applications')
    expect(listed.body.items[0]).not.toHaveProperty('cvKey')
  })
})

describe('page views', () => {
  it('counts a view once per address per page, and adds to the article total', async () => {
    const post = await publishedPost('counted')
    expect((await visitor.post('/public/track', { path: '/blog/counted' })).status).toBe(204)
    expect((await visitor.post('/public/track', { path: '/blog/counted' })).status).toBe(204)
    // Junk is answered the same way, and stored nowhere.
    expect((await visitor.post('/public/track', { path: 'javascript:alert(1)' })).status).toBe(204)

    await new Promise((resolve) => setTimeout(resolve, 200))
    const [views] = await pool.query<any[]>('SELECT path, count, content_type FROM page_views')
    expect(views).toEqual([{ path: '/blog/counted', count: 1, content_type: 'blog' }])
    expect((await api.get(`/blogs/${post.body.id}`)).body.views).toBe(1)
  })
})

describe('site settings', () => {
  it('publishes general, social and seo, but never where alerts go', async () => {
    await api.patch('/settings', { email: { alertEmail: 'alerts@example.com' } })
    const { body } = await visitor.get('/public/site')
    expect(Object.keys(body).sort()).toEqual(['general', 'seo', 'social'])
    expect(body.general.siteName).toBe('XAI Robotics')
    await api.patch('/settings', { email: { alertEmail: '' } })
  })
})
