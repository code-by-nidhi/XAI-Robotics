import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, pool, resetTables, startServer, stopServer, type Client } from './helpers.js'

/**
 * Testimonials: the admin CRUD contract and what the website may read.
 *
 * The public shape is asserted key for key — the site renders it directly, and
 * an extra field (status, a media id, who wrote it) is a leak, not a bonus.
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
  await resetTables('testimonials')
  await pool.query("DELETE FROM media WHERE folder = 'testimonial-test'")
})

const quote = (name: string, extra: Record<string, unknown> = {}) =>
  api.post('/testimonials', {
    name,
    role: 'Programme graduate',
    company: 'Batch 2025',
    quote: 'Building a robot from scratch taught me more than any textbook.',
    rating: 5,
    status: 'published',
    ...extra,
  })

describe('admin', () => {
  it('creates with defaults, edits partially and clears optional fields', async () => {
    const created = await api.post('/testimonials', { name: 'Draft Person', quote: 'Short and sweet.' })
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject({ status: 'draft', featured: false, order: 0, rating: null, avatar: null })

    const id = created.body.id as string
    const edited = await api.patch(`/testimonials/${id}`, { role: 'Parent', rating: 4 })
    expect(edited.body).toMatchObject({ role: 'Parent', rating: 4, status: 'draft', name: 'Draft Person' })

    // An order-only patch must not reset anything else.
    await api.patch(`/testimonials/${id}`, { status: 'published' })
    const reordered = await api.patch(`/testimonials/${id}`, { order: 3 })
    expect(reordered.body).toMatchObject({ order: 3, status: 'published', rating: 4 })

    const cleared = await api.patch(`/testimonials/${id}`, { role: '', rating: null })
    expect(cleared.body.role).toBeUndefined()
    expect(cleared.body.rating).toBeNull()

    expect((await api.get(`/testimonials/${id}`)).status).toBe(200)
    expect((await api.delete('/testimonials', { ids: [id] })).status).toBe(204)
    expect((await api.get(`/testimonials/${id}`)).status).toBe(404)
  })

  it('refuses a missing quote and an out-of-range rating', async () => {
    const res = await api.post('/testimonials', { name: 'Someone', quote: '', rating: 6 })
    expect(res.status).toBe(422)
    expect(Object.keys(res.body.fieldErrors)).toEqual(expect.arrayContaining(['quote', 'rating']))
  })

  it('lists with search, status and featured filters', async () => {
    await quote('Aarav Test', { featured: true })
    await quote('Meera Test', { status: 'draft' })
    await quote('Kabir Test')

    expect((await api.get('/testimonials')).body.total).toBe(3)
    expect((await api.get('/testimonials?status=draft')).body.items.map((t: any) => t.name)).toEqual(['Meera Test'])
    expect((await api.get('/testimonials?featured=1')).body.items.map((t: any) => t.name)).toEqual(['Aarav Test'])
    expect((await api.get('/testimonials?q=Kabir')).body.total).toBe(1)
  })

  it('is not open to anonymous callers', async () => {
    expect((await client().get('/testimonials')).status).toBe(401)
  })
})

describe('public', () => {
  it('shows published only, in order, in exactly the documented shape', async () => {
    await pool.query(
      `INSERT INTO media (id, filename, url, mime_type, size, alt, folder, created_at, updated_at)
       VALUES (UUID(), 'face.png', '/uploads/face.png', 'image/png', 10, 'A smiling graduate', 'testimonial-test', NOW(3), NOW(3))`,
    )
    const [media] = await pool.query<any[]>("SELECT id FROM media WHERE folder = 'testimonial-test' LIMIT 1")

    await quote('Second', { order: 2 })
    await quote('First', { order: 1, featured: true, avatar: { id: media[0].id }, role: '', company: '', rating: null })
    await quote('Hidden', { status: 'draft' })

    const { body } = await visitor.get('/public/testimonials')
    expect(body.total).toBe(2)
    expect(body.items.map((t: any) => t.name)).toEqual(['First', 'Second'])
    expect(Object.keys(body.items[0]).sort()).toEqual(['avatar', 'company', 'id', 'name', 'quote', 'rating', 'role'])
    expect(body.items[0]).toMatchObject({
      role: null,
      company: null,
      rating: null,
      avatar: { url: '/uploads/face.png', alt: 'A smiling graduate' },
    })
    expect(body.items[1]).toMatchObject({ role: 'Programme graduate', company: 'Batch 2025', rating: 5, avatar: null })

    const featured = await visitor.get('/public/testimonials?featured=1')
    expect(featured.body.items.map((t: any) => t.name)).toEqual(['First'])
  })
})
