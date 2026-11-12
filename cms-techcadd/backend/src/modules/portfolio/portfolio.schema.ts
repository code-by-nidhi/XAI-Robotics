import { z } from 'zod'

import {
  iconField,
  mediaRef,
  optionalId,
  optionalText,
  optionalUrl,
  publishAtField,
  resultSchema,
  richText,
  seoSchema,
  slugField,
  sortOrderField,
  statusField,
  stringList,
} from '../shared/content.schema.js'
import { categoryField, PORTFOLIO_CATEGORIES } from '../shared/taxonomy.js'

/**
 * A portfolio item. Publishing needs a summary and a category, because the
 * website's portfolio is filtered by category and an uncategorised item would
 * appear under none of the tabs.
 */
const base = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Keep titles under 200 characters.'),
  slug: slugField,
  client: optionalText(160, 'the client'),
  industry: optionalText(120, 'the industry'),
  summary: z.string().trim().max(320, 'Keep the summary under 320 characters.'),
  description: richText,
  category: categoryField(PORTFOLIO_CATEGORIES),
  caseStudyId: optionalId,
  technologies: stringList(20, 60, 'technologies'),
  team: stringList(20, 60, 'team members'),
  results: z.array(resultSchema).max(6, 'Use at most 6 results.'),
  projectUrl: optionalUrl(500),
  githubUrl: optionalUrl(500),
  duration: optionalText(80, 'the duration'),
  icon: iconField,
  coverImage: mediaRef.nullish(),
  featured: z.boolean(),
  /** Shown on the site at all — independent of publishing; see 052. */
  state: z.enum(['active', 'inactive']),
  sortOrder: sortOrderField,
  status: statusField,
  publishAt: publishAtField,
  seo: seoSchema,
})

export const portfolioSchema = base.extend({
  summary: base.shape.summary.default(''),
  description: richText.default(''),
  technologies: base.shape.technologies.default([]),
  team: base.shape.team.default([]),
  results: base.shape.results.default([]),
  featured: z.boolean().default(false),
  state: base.shape.state.default('active'),
  sortOrder: sortOrderField.default(0),
  status: statusField.default('draft'),
  seo: seoSchema.default({}),
})

/** Defaults stay off the patch schema — see the note in shared/content.schema.ts. */
export const portfolioPatchSchema = base.partial()

export type PortfolioInput = z.infer<typeof portfolioSchema>
export type PortfolioPatch = z.infer<typeof portfolioPatchSchema>
