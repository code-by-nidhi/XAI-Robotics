import { z } from 'zod'

import type { BlogCreate } from '../../api/resources/blogs'
import type { Blog } from '../../types'
import {
  mediaRefSchema,
  publishingShape,
  refinePublishing,
  seoSchema,
  slugSchema,
  toDateTimeInput,
  toPublishAt,
} from '../shared/contentSchema'

/**
 * A draft needs only a title and slug. The API checks the excerpt and body
 * when the post goes live and answers with everything missing at once, so
 * neither is required here.
 */
export const blogSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(200, 'Keep titles under 200 characters.'),
    slug: slugSchema,
    authorId: z.string().optional(),
    category: z.string().optional(),
    relatedService: z.string().optional(),
    tags: z.array(z.string().trim().min(1).max(60)).max(20, 'Use at most 20 tags.'),
    coverImage: mediaRefSchema.nullish(),
    excerpt: z.string().trim().max(320, 'Keep excerpts under 320 characters.'),
    body: z.string(),
    ...publishingShape,
    seo: seoSchema,
  })
  .superRefine(refinePublishing)

export type BlogFormValues = z.infer<typeof blogSchema>

export function emptyBlog(): BlogFormValues {
  return {
    title: '',
    slug: '',
    authorId: '',
    category: '',
    relatedService: '',
    tags: [],
    coverImage: null,
    excerpt: '',
    body: '',
    status: 'draft',
    publishAt: undefined,
    seo: { keywords: [] },
  }
}

export function blogToValues(record: Blog): BlogFormValues {
  return {
    ...emptyBlog(),
    title: record.title,
    slug: record.slug,
    authorId: record.authorId ?? '',
    category: record.category ?? '',
    relatedService: record.relatedService ?? '',
    tags: record.tags ?? [],
    coverImage: record.coverImage ?? null,
    excerpt: record.excerpt ?? '',
    body: record.body ?? '',
    status: record.status,
    publishAt: toDateTimeInput(record.publishAt),
    seo: { keywords: [], ...record.seo },
  }
}

export function blogToPayload(values: BlogFormValues): BlogCreate {
  return { ...values, publishAt: toPublishAt(values.status, values.publishAt) }
}

/** ~200 wpm over the stripped HTML — close enough for a reading-time badge. */
export function readingTimeMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.round(words / 200))
}
