import { z } from 'zod'

import { SITE_ICONS } from '../../types'
import { parseServerDate } from '../../lib/format'

/**
 * Zod pieces every website content form is built from.
 *
 * They mirror the API's shared/content.schema.ts so a value the form accepts is
 * one the server accepts too; the server stays the authority (its publish
 * checks are not repeated here) and its field errors map back onto these names.
 */

export const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required.')
  .max(160, 'Keep the slug under 160 characters.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only.')

export const optionalText = (max: number, label = 'this field') =>
  z.string().trim().max(max, `Keep ${label} under ${max} characters.`).optional()

export const optionalUrl = z
  .union([
    z.string().trim().regex(/^https?:\/\/\S+$/, 'Enter a full URL starting with https://'),
    z.literal(''),
  ])
  .optional()

export const iconSchema = z.union([z.enum(SITE_ICONS), z.literal('')]).optional()

/** A list of short strings. Blank rows are dropped on save, not refused. */
export const stringListSchema = (maxItems: number, itemMax = 200, what = 'items') =>
  z
    .array(z.string().trim().max(itemMax, `Keep each item under ${itemMax} characters.`))
    .transform((items) => items.filter(Boolean))
    .pipe(z.array(z.string()).max(maxItems, `Use at most ${maxItems} ${what}.`))

export const resultsSchema = z
  .array(
    z.object({
      value: z.string().trim().max(40, 'Keep the figure short (40 characters).'),
      label: z.string().trim().max(160, 'Keep the description under 160 characters.'),
    }),
  )
  // A row the editor added and never filled is not a result.
  .transform((rows) => rows.filter((row) => row.value || row.label))
  .pipe(
    z
      .array(
        z.object({
          value: z.string().min(1, 'Add the figure.'),
          label: z.string().min(1, 'Describe the result.'),
        }),
      )
      .max(6, 'Use at most 6 results.'),
  )

export const seoSchema = z.object({
  metaTitle: optionalText(100, 'the meta title'),
  metaDescription: optionalText(220, 'the meta description'),
  keywords: z.array(z.string().max(60)).max(20).optional(),
  canonicalUrl: optionalUrl,
  ogTitle: optionalText(200, 'the social title'),
  ogDescription: optionalText(320, 'the social description'),
  ogImage: mediaRefSchema.nullish(),
  noIndex: z.boolean().optional(),
})

export const contentStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived'])

/**
 * Status plus the moment a scheduled item goes live.
 *
 * `publishAt` is the value of a datetime-local input — local wall time without
 * a zone — and becomes ISO only on the way out (see `toPublishAt`). Spread
 * into each module's object, then checked with `refinePublishing`.
 */
export const publishingShape = {
  status: contentStatusSchema,
  publishAt: z.string().optional(),
}

/** Scheduling without a time would be refused by the API anyway; say so here. */
export function refinePublishing(
  values: { status: string; publishAt?: string },
  ctx: z.RefinementCtx,
) {
  if (values.status !== 'scheduled') return
  if (!values.publishAt) {
    ctx.addIssue({ code: 'custom', path: ['publishAt'], message: 'Choose a date and time to publish.' })
    return
  }
  const at = new Date(values.publishAt)
  if (Number.isNaN(at.getTime())) {
    ctx.addIssue({ code: 'custom', path: ['publishAt'], message: 'Choose a valid date and time.' })
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** A server timestamp as a datetime-local input value (yyyy-MM-ddTHH:mm). */
export function toDateTimeInput(value?: string | null): string | undefined {
  if (!value) return undefined
  const date = parseServerDate(value)
  if (Number.isNaN(date.getTime())) return undefined
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * What a save sends for `publishAt`.
 *
 * Only a scheduled item carries one — for every other status the API ignores
 * the field, and sending a stale schedule with a draft would only confuse the
 * next reader of the payload.
 */
export function toPublishAt(status: string, local?: string): string | undefined {
  if (status !== 'scheduled' || !local) return undefined
  const date = new Date(local)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
