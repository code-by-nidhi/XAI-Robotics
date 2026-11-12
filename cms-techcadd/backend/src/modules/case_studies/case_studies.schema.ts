import { z } from 'zod'

import {
  iconField,
  mediaRef,
  optionalText,
  publishAtField,
  resultSchema,
  richText,
  seoSchema,
  slugField,
  sortOrderField,
  statusField,
  stringList,
} from '../shared/content.schema.js'
import { CASE_STUDY_CATEGORIES, categoryField, serviceField } from '../shared/taxonomy.js'

/**
 * A case study. A draft needs only a title and slug;
 * the client, summary and story are checked when it goes live.
 */
const base = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Keep titles under 200 characters.'),
  slug: slugField,
  client: z.string().trim().max(160, 'Keep the client description under 160 characters.'),
  industry: z.string().trim().max(120),
  excerpt: z.string().trim().max(320, 'Keep the summary under 320 characters.'),
  overview: richText,
  challenge: richText,
  approach: richText,
  solution: richText,
  implementation: richText,
  results: z.array(resultSchema).max(6, 'Use at most 6 results.'),
  technologies: stringList(20, 60, 'technologies'),
  duration: optionalText(80, 'the duration'),
  testimonialText: optionalText(1000, 'the quote'),
  testimonialName: optionalText(120, 'the name'),
  testimonialRole: optionalText(120, 'the role'),
  icon: iconField,
  serviceSlug: serviceField,
  category: categoryField(CASE_STUDY_CATEGORIES),
  coverImage: mediaRef.nullish(),
  sortOrder: sortOrderField,
  status: statusField,
  publishAt: publishAtField,
  seo: seoSchema,
})

export const caseStudySchema = base.extend({
  client: base.shape.client.default(''),
  industry: base.shape.industry.default(''),
  excerpt: base.shape.excerpt.default(''),
  overview: richText.default(''),
  challenge: richText.default(''),
  approach: richText.default(''),
  solution: richText.default(''),
  implementation: richText.default(''),
  results: base.shape.results.default([]),
  technologies: base.shape.technologies.default([]),
  sortOrder: sortOrderField.default(0),
  status: statusField.default('draft'),
  seo: seoSchema.default({}),
})

/** Defaults stay off the patch schema — see the note in shared/content.schema.ts. */
export const caseStudyPatchSchema = base.partial()

export type CaseStudyInput = z.infer<typeof caseStudySchema>
export type CaseStudyPatch = z.infer<typeof caseStudyPatchSchema>
