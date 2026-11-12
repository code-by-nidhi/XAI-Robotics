import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, pool, resetTables, startServer, stopServer, type Client } from './helpers.js'

/**
 * The rules that hold across every module.
 *
 * Each of these started as a real bug found by driving the CMS against MySQL,
 * and each one was invisible from a single module's tests — they are properties
 * of the request contract, so they belong in one place.
 */
let api: Client

beforeAll(async () => {
  await startServer()
  api = client()
  await api.signIn()
})

afterAll(stopServer)

beforeEach(async () => {
  await resetTables('slug_redirects', 'portfolio', 'case_studies', 'blogs')
  await pool.query("DELETE FROM media WHERE folder = 'contract-test'")
})

async function seedMedia(): Promise<string> {
  await pool.query(
    `INSERT INTO media (id, filename, url, mime_type, size, alt, folder, created_at, updated_at)
     VALUES (UUID(), 'probe.png', '/uploads/probe.png', 'image/png', 10, 'probe', 'contract-test', NOW(3), NOW(3))`,
  )
  const [found] = await pool.query<any[]>(
    "SELECT id FROM media WHERE folder = 'contract-test' ORDER BY created_at DESC LIMIT 1",
  )
  return found[0].id as string
}

describe('absent means leave alone, empty means clear', () => {
  it('clears an optional reference when sent as an empty string', async () => {
    const study = await api.post('/case-studies', {
      title: 'Probe study',
      slug: 'probe-study',
      category: 'generative-ai',
      serviceSlug: 'rag-solutions',
    })
    expect(study.body.category).toBe('generative-ai')
    expect(study.body.serviceSlug).toBe('rag-solutions')

    const cleared = await api.patch(`/case-studies/${study.body.id}`, { category: '', serviceSlug: '' })
    expect(cleared.status).toBe(200)
    expect(cleared.body.category).toBeUndefined()
    expect(cleared.body.serviceSlug).toBeUndefined()
  })

  it('accepts an empty reference on create rather than rejecting it', async () => {
    // A placeholder <option> submits '', which is not on the list but is a
    // perfectly valid "none".
    const created = await api.post('/portfolio', { title: 'No category', slug: 'no-category', category: '', caseStudyId: '' })
    expect(created.status).toBe(201)
    expect(created.body.category).toBeUndefined()
    expect(created.body.caseStudyId).toBeUndefined()
  })

  it('does not turn an empty string into NULL for a NOT NULL column', async () => {
    // Blanket '' -> NULL once broke saving a record with a blank text field.
    const study = await api.post('/case-studies', { title: 'A', slug: 'study-a', client: 'Someone' })
    const blanked = await api.patch(`/case-studies/${study.body.id}`, { client: '' })
    expect(blanked.status).toBe(200)
    expect(blanked.body.client).toBe('')
  })
})

describe('image slots', () => {
  it('removes an image when sent as null', async () => {
    const mediaId = await seedMedia()
    const post = await api.post('/blogs', { title: 'Cover probe', slug: 'cover-probe', coverImage: { id: mediaId } })
    expect(post.body.coverImage?.id).toBe(mediaId)

    const cleared = await api.patch(`/blogs/${post.body.id}`, { coverImage: null })
    expect(cleared.status).toBe(200)
    expect(cleared.body.coverImage).toBeUndefined()
  })

  it('leaves an image alone when the key is absent', async () => {
    const mediaId = await seedMedia()
    const post = await api.post('/blogs', { title: 'Keep probe', slug: 'keep-probe', coverImage: { id: mediaId } })

    const renamed = await api.patch(`/blogs/${post.body.id}`, { title: 'Renamed' })
    expect(renamed.body.coverImage?.id).toBe(mediaId)
  })
})

describe('partial updates', () => {
  it('does not apply create-time defaults to a patch', async () => {
    // `.partial()` does not strip `.default()`, so a drag-reorder sending only
    // `{ sortOrder }` would silently reset the status and the visibility.
    const item = await api.post('/portfolio', {
      title: 'Ordered',
      slug: 'ordered',
      summary: 'A summary that is long enough to publish.',
      category: 'generative-ai',
      state: 'inactive',
      status: 'published',
    })
    expect(item.status).toBe(201)

    const reordered = await api.patch(`/portfolio/${item.body.id}`, { sortOrder: 5 })
    expect(reordered.body.sortOrder).toBe(5)
    expect(reordered.body.status).toBe('published')
    expect(reordered.body.state).toBe('inactive')
    expect(reordered.body.category).toBe('generative-ai')
  })

  it('keeps a published item published when another field is edited', async () => {
    const item = await api.post('/portfolio', {
      title: 'Live item',
      slug: 'live-item',
      summary: 'A summary that is long enough to publish.',
      category: 'automation-agents',
      status: 'published',
    })
    const edited = await api.patch(`/portfolio/${item.body.id}`, { duration: '6 weeks' })
    expect(edited.body.status).toBe('published')
    expect(edited.body.duration).toBe('6 weeks')
  })
})

describe('publishing', () => {
  it('lets a draft be half-written but checks what goes live', async () => {
    expect((await api.post('/blogs', { title: 'Idea', slug: 'idea' })).status).toBe(201)

    const refused = await api.post('/blogs', { title: 'Thin', slug: 'thin', status: 'published' })
    expect(refused.status).toBe(422)
    expect(Object.keys(refused.body.fieldErrors)).toEqual(expect.arrayContaining(['excerpt', 'body']))
  })

  it('checks the record as it will be, not just the patch', async () => {
    const live = await api.post('/case-studies', {
      title: 'Complete',
      slug: 'complete',
      client: 'A bank',
      excerpt: 'A summary long enough to publish this.',
      challenge: `<p>${'Plenty of words describing the challenge. '.repeat(3)}</p>`,
      status: 'published',
    })
    expect(live.status).toBe(201)

    // Emptying a required field on something live is refused.
    const emptied = await api.patch(`/case-studies/${live.body.id}`, { client: '' })
    expect(emptied.status).toBe(422)
    expect(emptied.body.fieldErrors?.client).toBeTruthy()
  })

  it('keeps the first publication date across a republish', async () => {
    const body = `<p>${'Words for the body of this post. '.repeat(4)}</p>`
    const post = await api.post('/blogs', {
      title: 'Dated', slug: 'dated', excerpt: 'An excerpt that is long enough.', body, status: 'published',
    })
    const first = post.body.publishedAt
    await api.patch(`/blogs/${post.body.id}`, { status: 'draft' })
    const again = await api.patch(`/blogs/${post.body.id}`, { status: 'published' })
    expect(again.body.publishedAt).toBe(first)
  })

  it('requires a future time to schedule', async () => {
    const res = await api.post('/blogs', {
      title: 'Soon', slug: 'soon', excerpt: 'An excerpt that is long enough.',
      body: `<p>${'Words for the body of this post. '.repeat(4)}</p>`,
      status: 'scheduled', publishAt: new Date(Date.now() - 60_000).toISOString(),
    })
    expect(res.status).toBe(422)
    expect(res.body.fieldErrors?.publishAt).toBeTruthy()
  })
})

describe('rich text', () => {
  it('is sanitised on save', async () => {
    const post = await api.post('/blogs', {
      title: 'Unsafe',
      slug: 'unsafe',
      body: '<p onclick="steal()">Hi</p><script>alert(1)</script><a href="https://example.com">x</a><iframe src="https://evil.example"></iframe>',
    })
    expect(post.body.body).not.toMatch(/script|onclick|evil\.example/)
    expect(post.body.body).toContain('rel="noopener noreferrer"')
  })
})

describe('categories and services', () => {
  it('must be on the fixed list for the content type they file', async () => {
    // 'cloud-infrastructure' is a portfolio category, not a blog one.
    const res = await api.post('/blogs', { title: 'Misfiled', slug: 'misfiled', category: 'cloud-infrastructure' })
    expect(res.status).toBe(422)
    expect(res.body.fieldErrors?.category).toBeTruthy()

    const filed = await api.post('/blogs', { title: 'Filed', slug: 'filed', category: 'security' })
    expect(filed.status).toBe(201)
    expect(filed.body.category).toBe('security')
  })

  it("refuses a service that is not one of the website's", async () => {
    const blog = await api.post('/blogs', { title: 'Odd', slug: 'odd', relatedService: 'no-such-service' })
    expect(blog.status).toBe(422)
    expect(blog.body.fieldErrors?.relatedService).toBeTruthy()

    const study = await api.post('/case-studies', { title: 'Odd', slug: 'odd-study', serviceSlug: 'no-such-service' })
    expect(study.status).toBe(422)
    expect(study.body.fieldErrors?.serviceSlug).toBeTruthy()
  })

  it('filters admin lists by category and service', async () => {
    await api.post('/blogs', { title: 'Strategy', slug: 'strategy', category: 'ai-strategy', relatedService: 'ai-consulting' })
    await api.post('/blogs', { title: 'Other', slug: 'other', category: 'delivery' })

    const byCategory = await api.get('/blogs?category=ai-strategy')
    expect(byCategory.body.items.map((b: any) => b.slug)).toEqual(['strategy'])
    const byService = await api.get('/blogs?relatedService=ai-consulting')
    expect(byService.body.items.map((b: any) => b.slug)).toEqual(['strategy'])
  })
})

describe('error contract', () => {
  it('reports an unknown foreign key as a field error, not a server fault', async () => {
    const res = await api.post('/portfolio', {
      title: 'Ghost',
      slug: 'ghost',
      caseStudyId: '00000000-0000-0000-0000-000000000000',
    })
    expect(res.status).toBe(422)
    expect(res.body.fieldErrors?.caseStudyId).toBeTruthy()
  })

  it('keys validation errors by form field name', async () => {
    const res = await api.post('/blogs', { title: '', slug: 'Not A Slug' })
    expect(res.status).toBe(422)
    expect(Object.keys(res.body.fieldErrors)).toContain('slug')
  })

  it('refuses a slug already in use', async () => {
    await api.post('/blogs', { title: 'One', slug: 'taken' })
    const res = await api.post('/blogs', { title: 'Two', slug: 'taken' })
    expect(res.status).toBe(422)
    expect(res.body.fieldErrors?.slug).toBeTruthy()
  })
})

/**
 * Every API path the CMS sidebar leads to.
 *
 * Kept in step with the frontend's navigation by hand, which is the point of
 * the test below: a sidebar entry whose API is not mounted 404s the moment an
 * admin clicks it, and that is not something the frontend build can catch.
 *
 * The SEO page is here as /redirects because that is the endpoint it reads —
 * there is deliberately no /api/seo.
 */
const SIDEBAR_APIS = [
  '/dashboard/summary',
  '/analytics/overview',
  '/blogs',
  '/case-studies',
  '/portfolio',
  '/jobs',
  '/applications',
  '/tags',
  '/faqs',
  '/faq-categories',
  '/enquiries',
  '/media',
  '/redirects',
  '/settings',
  '/users',
  '/activity',
]

describe('every module the sidebar reaches', () => {
  it('is mounted — a 404 here is a dead link in the CMS', async () => {
    for (const path of SIDEBAR_APIS) {
      expect((await api.get(path)).status, `${path} should not 404`).not.toBe(404)
    }
  })

  it('refuses anonymous callers', async () => {
    const anonymous = client()
    for (const path of SIDEBAR_APIS) {
      expect((await anonymous.get(path)).status, path).toBe(401)
    }
  })

  it('no longer mounts the education modules', async () => {
    for (const path of ['/courses', '/events', '/gallery', '/testimonials', '/reviews', '/ai-knowledge', '/comments']) {
      expect((await api.get(path)).status, path).toBe(404)
    }
  })

  it('no longer mounts the modules that became fixed lists', async () => {
    for (const path of ['/categories', '/pages', '/projects', '/services']) {
      expect((await api.get(path)).status, path).toBe(404)
    }
  })
})
