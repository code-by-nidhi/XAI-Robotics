import { z } from 'zod'

import type { CaseStudyCreate } from '../../api/resources/caseStudies'
import type { CaseStudy } from '../../types'
import {
  iconSchema,
  mediaRefSchema,
  optionalText,
  publishingShape,
  refinePublishing,
  resultsSchema,
  seoSchema,
  slugSchema,
  toDateTimeInput,
  toPublishAt,
} from '../shared/contentSchema'

/**
 * A draft needs only a title and slug. The API checks the client, summary and
 * story when the case study goes live and lists what is missing, so those are
 * not required here — an editor can save half a story.
 */
export const caseStudySchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(200, 'Keep titles under 200 characters.'),
    slug: slugSchema,
    client: z.string().trim().max(160, 'Keep the client description under 160 characters.'),
    industry: z.string().trim().max(120, 'Keep the industry under 120 characters.'),
    excerpt: z.string().trim().max(320, 'Keep the summary under 320 characters.'),
    overview: z.string(),
    challenge: z.string(),
    approach: z.string(),
    solution: z.string(),
    implementation: z.string(),
    results: resultsSchema,
    technologies: z.array(z.string().max(60)).max(20, 'Use at most 20 technologies.'),
    duration: optionalText(80, 'the duration'),
    testimonialText: optionalText(1000, 'the quote'),
    testimonialName: optionalText(120, 'the name'),
    testimonialRole: optionalText(120, 'the role'),
    icon: iconSchema,
    serviceSlug: z.string().optional(),
    category: z.string().optional(),
    coverImage: mediaRefSchema.nullish(),
    sortOrder: z.number().int().min(0, 'Use 0 or more.').max(9999),
    ...publishingShape,
    seo: seoSchema,
  })
  .superRefine(refinePublishing)

export type CaseStudyFormValues = z.infer<typeof caseStudySchema>

export function emptyCaseStudy(): CaseStudyFormValues {
  return {
    title: '',
    slug: '',
    client: '',
    industry: '',
    excerpt: '',
    overview: '',
    challenge: '',
    approach: '',
    solution: '',
    implementation: '',
    results: [],
    technologies: [],
    duration: '',
    testimonialText: '',
    testimonialName: '',
    testimonialRole: '',
    icon: '',
    serviceSlug: '',
    category: '',
    coverImage: null,
    sortOrder: 0,
    status: 'draft',
    publishAt: undefined,
    seo: {},
  }
}

export function caseStudyToValues(record: CaseStudy): CaseStudyFormValues {
  return {
    ...emptyCaseStudy(),
    title: record.title,
    slug: record.slug,
    client: record.client ?? '',
    industry: record.industry ?? '',
    excerpt: record.excerpt ?? '',
    overview: record.overview ?? '',
    challenge: record.challenge ?? '',
    approach: record.approach ?? '',
    solution: record.solution ?? '',
    implementation: record.implementation ?? '',
    results: record.results ?? [],
    technologies: record.technologies ?? [],
    duration: record.duration ?? '',
    testimonialText: record.testimonialText ?? '',
    testimonialName: record.testimonialName ?? '',
    testimonialRole: record.testimonialRole ?? '',
    icon: record.icon ?? '',
    serviceSlug: record.serviceSlug ?? '',
    category: record.category ?? '',
    coverImage: record.coverImage ?? null,
    sortOrder: record.sortOrder ?? 0,
    status: record.status,
    publishAt: toDateTimeInput(record.publishAt),
    seo: record.seo ?? {},
  }
}

/** Empty strings are sent, not dropped: the API reads '' as "clear this field". */
export function caseStudyToPayload(values: CaseStudyFormValues): CaseStudyCreate {
  return {
    ...values,
    publishAt: toPublishAt(values.status, values.publishAt),
  }
}

