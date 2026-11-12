import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, resetTables, startServer, stopServer, type Client } from './helpers.js'

let api: Client

beforeAll(async () => {
  await startServer()
  api = client()
  await api.signIn()
})

afterAll(stopServer)

beforeEach(async () => {
  await resetTables('enquiries', 'case_studies', 'portfolio', 'blogs')
})

const enquiry = (name: string) => ({
  name,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
  message: 'We would like to talk about a project.',
})

describe('dashboard summary', () => {
  it('answers every panel in one request', async () => {
    const res = await api.get('/dashboard/summary')

    expect(res.status).toBe(200)
    for (const key of ['totals', 'today', 'enquiryTrend', 'contentOverview', 'recentContent', 'recentActivity', 'recentEnquiries']) {
      expect(res.body, key).toHaveProperty(key)
    }
    for (const key of ['blogs', 'caseStudies', 'portfolio', 'jobs', 'applications', 'enquiries']) {
      expect(res.body.totals, key).toHaveProperty(key)
    }
  })

  it('returns seven trend points including days with nothing', async () => {
    const admin = client()
    await admin.signIn()
    await admin.unlockEnquiries()
    await admin.post('/enquiries', enquiry('Trend'))

    const { body } = await admin.get('/dashboard/summary')
    // Grouped in SQL, then padded — a day with no enquiries still needs a bar.
    expect(body.enquiryTrend).toHaveLength(7)
    expect(body.enquiryTrend.at(-1).date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(body.enquiryTrend.reduce((sum: number, p: any) => sum + p.value, 0)).toBe(1)
    expect(body.totals.enquiries).toBe(1)
    expect(body.today.newEnquiries).toBe(1)
  })

  it('does not show leads to a browser that has not cleared the enquiries password', async () => {
    const admin = client()
    await admin.signIn()
    await admin.unlockEnquiries()
    await admin.post('/enquiries', enquiry('Private Person'))

    const locked = client()
    await locked.signIn()
    const { body } = await locked.get('/dashboard/summary')
    // The count is not personal data; the names are.
    expect(body.totals.enquiries).toBe(1)
    expect(body.recentEnquiries).toEqual([])
  })

  it('adds up content by status across tables', async () => {
    await api.post('/portfolio', {
      title: 'Live piece', slug: 'live-piece', summary: 'A summary that is comfortably long enough.',
      category: 'robotic-arms', status: 'published',
    })
    await api.post('/case-studies', { title: 'Hidden', slug: 'hidden' })

    const { body } = await api.get('/dashboard/summary')
    expect(body.contentOverview.published).toBeGreaterThanOrEqual(1)
    expect(body.contentOverview.draft).toBeGreaterThanOrEqual(1)
    expect(body.contentOverview.total).toBe(
      body.contentOverview.published + body.contentOverview.draft +
        body.contentOverview.scheduled + body.contentOverview.archived,
    )
    expect(body.recentContent.map((r: any) => r.kind)).toEqual(expect.arrayContaining(['portfolio', 'case-studies']))
  })

  it('needs a session', async () => {
    expect((await client().get('/dashboard/summary')).status).toBe(401)
  })
})

describe('global search', () => {
  beforeEach(async () => {
    await api.post('/blogs', { title: 'React Fundamentals', slug: 'react-fundamentals' })
    await api.post('/case-studies', { title: 'Reactive pricing', slug: 'reactive-pricing', client: 'A retailer' })
  })

  it('finds a partial word', async () => {
    // Why LIKE rather than FULLTEXT: the box has to match while the user is
    // still typing.
    const res = await api.get('/search?q=rea')
    const blogs = res.body.groups.find((g: any) => g.key === 'blogs')
    expect(blogs?.hits?.[0]?.label).toBe('React Fundamentals')
  })

  it('groups hits by what they are, leads only once unlocked', async () => {
    const admin = client()
    await admin.signIn()
    expect((await admin.get('/search?q=react')).body.groups.map((g: any) => g.key).sort()).toEqual(['blogs', 'case-studies'])

    await admin.unlockEnquiries()
    await admin.post('/enquiries', enquiry('React Fan'))
    const res = await admin.get('/search?q=react')
    expect(res.body.groups.map((g: any) => g.key).sort()).toEqual(['blogs', 'case-studies', 'enquiries'])
  })

  it('omits groups with nothing in them', async () => {
    const res = await api.get('/search?q=react')
    expect(res.body.groups.every((g: any) => g.hits.length > 0)).toBe(true)
  })

  it('ignores a term too short to narrow anything', async () => {
    const res = await api.get('/search?q=r')
    expect(res.body.groups).toEqual([])
  })

  it('needs a session', async () => {
    expect((await client().get('/search?q=react')).status).toBe(401)
  })
})
