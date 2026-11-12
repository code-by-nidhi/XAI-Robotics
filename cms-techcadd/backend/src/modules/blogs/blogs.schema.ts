import { z } from 'zod'

import {
  mediaRef,
  optionalId,
  publishAtField,
  richText,
  seoSchema,
  slugField,
  statusField,
} from '../shared/content.schema.js'
import { BLOG_CATEGORIES, categoryField, serviceField } from '../shared/taxonomy.js'

const seo = seoSchema.extend({ keywords: z.array(z.string().max(60)).max(20).optional() })

/**
 * A blog post.
 *
 * A draft needs only a title and slug; the excerpt and body are checked when
 * the post goes live (see `publishProblems` in the repository), so an editor
 * can save half an idea.
 */
const base = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Keep titles under 200 characters.'),
  slug: slugField,
  authorId: optionalId,
  category: categoryField(BLOG_CATEGORIES),
  /** The service page promoted in the article's sidebar. */
  relatedService: serviceField,
  tags: z.array(z.string().trim().min(1).max(60)).max(20, 'Use at most 20 tags.'),
  coverImage: mediaRef.nullish(),
  excerpt: z.string().trim().max(320, 'Keep excerpts under 320 characters.'),
  body: richText,
  status: statusField,
  publishAt: publishAtField,
  seo,
})

export const blogSchema = base.extend({
  tags: base.shape.tags.default([]),
  excerpt: base.shape.excerpt.default(''),
  body: richText.default(''),
  status: statusField.default('draft'),
  seo: seo.default({}),
})

/** Defaults stay off the patch schema — see the note in shared/content.schema.ts. */
export const blogPatchSchema = base.partial().extend({ seo: seo.partial().optional() })

export type BlogInput = z.infer<typeof blogSchema>
export type BlogPatch = z.infer<typeof blogPatchSchema>
