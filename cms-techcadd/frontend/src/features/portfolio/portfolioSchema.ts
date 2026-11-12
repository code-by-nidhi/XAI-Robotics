import { z } from 'zod'

import type { PortfolioItemCreate } from '../../api/resources/portfolio'
import type { PortfolioItem } from '../../types'
import {
  iconSchema,
  mediaRefSchema,
  optionalText,
  optionalUrl,
  publishingShape,
  refinePublishing,
  resultsSchema,
  seoSchema,
  slugSchema,
  toDateTimeInput,
  toPublishAt,
} from '../shared/contentSchema'

/**
 * Publishing needs a summary and a category — the website's portfolio is
 * filtered by category, so an uncategorised item would sit under no tab. The
 * API enforces both when the item goes live.
 */
export const portfolioSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(200, 'Keep titles under 200 characters.'),
    slug: slugSchema,
    client: optionalText(160, 'the client'),
    industry: optionalText(120, 'the industry'),
    summary: z.string().trim().max(320, 'Keep the summary under 320 characters.'),
    description: z.string(),
    category: z.string().optional(),
    caseStudyId: z.string().optional(),
    technologies: z.array(z.string().max(60)).max(20, 'Use at most 20 technologies.'),
    team: z.array(z.string().max(60)).max(20, 'Use at most 20 team members.'),
    results: resultsSchema,
    projectUrl: optionalUrl,
    githubUrl: optionalUrl,
    duration: optionalText(80, 'the duration'),
    icon: iconSchema,
    coverImage: mediaRefSchema.nullish(),
    featured: z.boolean(),
    state: z.enum(['active', 'inactive']),
    sortOrder: z.number().int().min(0, 'Use 0 or more.').max(9999),
    ...publishingShape,
    seo: seoSchema,
  })
  .superRefine(refinePublishing)

export type PortfolioFormValues = z.infer<typeof portfolioSchema>

export function emptyPortfolioItem(): PortfolioFormValues {
  return {
    title: '',
    slug: '',
    client: '',
    industry: '',
    summary: '',
    description: '',
    category: '',
    caseStudyId: '',
    technologies: [],
    team: [],
    results: [],
    projectUrl: '',
    githubUrl: '',
    duration: '',
    icon: '',
    coverImage: null,
    featured: false,
    state: 'active',
    sortOrder: 0,
    status: 'draft',
    publishAt: undefined,
    seo: {},
  }
}

export function portfolioToValues(record: PortfolioItem): PortfolioFormValues {
  return {
    ...emptyPortfolioItem(),
    title: record.title,
    slug: record.slug,
    client: record.client ?? '',
    industry: record.industry ?? '',
    summary: record.summary ?? '',
    description: record.description ?? '',
    category: record.category ?? '',
    caseStudyId: record.caseStudyId ?? '',
    technologies: record.technologies ?? [],
    team: record.team ?? [],
    results: record.results ?? [],
    projectUrl: record.projectUrl ?? '',
    githubUrl: record.githubUrl ?? '',
    duration: record.duration ?? '',
    icon: record.icon ?? '',
    coverImage: record.coverImage ?? null,
    featured: record.featured,
    state: record.state,
    sortOrder: record.sortOrder ?? 0,
    status: record.status,
    publishAt: toDateTimeInput(record.publishAt),
    seo: record.seo ?? {},
  }
}

export function portfolioToPayload(values: PortfolioFormValues): PortfolioItemCreate {
  return { ...values, publishAt: toPublishAt(values.status, values.publishAt) }
}
