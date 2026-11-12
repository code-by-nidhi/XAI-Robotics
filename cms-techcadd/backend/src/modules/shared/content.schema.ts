import { z } from 'zod'

/**
 * Pieces every Zaavi content type is built from.
 *
 * One definition each, because the website reads these fields the same way for
 * every type: an SEO block that accepted a 300-character title on case studies
 * and refused it on blogs would be the same field with two rules.
 */

/**
 * An image slot. Absent means "leave it alone", null means "remove it" — an
 * image is an object, so '' cannot carry "cleared" the way it does for an id.
 */
export const mediaRef = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export type MediaRef = z.infer<typeof mediaRef>

/** '' is kept rather than dropped: the repositories write it as NULL. */
export const optionalId = z.string().max(40).optional()

/** Same rule as the website's router: lowercase words joined by single hyphens. */
export const slugField = z
  .string()
  .trim()
  .min(1, 'Slug is required.')
  .max(160, 'Keep the slug under 160 characters.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only.')

/** Free text that may be blank; '' clears it. */
export const optionalText = (max: number, label = 'this field') =>
  z.string().trim().max(max, `Keep ${label} under ${max} characters.`).optional()

/** A full http(s) link, or '' for none. */
export const optionalUrl = (max = 500) =>
  z
    .union([
      z.string().trim().max(max).regex(/^https?:\/\/\S+$/, 'Enter a full URL starting with https://'),
      z.literal(''),
    ])
    .optional()

/** Rich text: sanitised on save, so only the size is checked here. */
export const richText = z.string().max(500_000, 'This section is too long to save.')

/** A list of short strings, in the editor's order. */
export const stringList = (maxItems: number, itemMax = 200, what = 'items') =>
  z
    .array(z.string().trim().min(1).max(itemMax, `Keep each item under ${itemMax} characters.`))
    .max(maxItems, `Use at most ${maxItems} ${what}.`)

/** A headline result: "40%" / "faster onboarding". */
export const resultSchema = z.object({
  value: z.string().trim().min(1, 'Add the figure.').max(40, 'Keep the figure short (40 characters).'),
  label: z.string().trim().min(1, 'Describe the result.').max(160, 'Keep the description under 160 characters.'),
})

/** The website's icon set (src/lib/site/content.ts on the site). */
export const ICONS = [
  'spark', 'workflow', 'chart', 'chat', 'cloud', 'signal', 'compass', 'doc', 'text', 'bot', 'brain',
  'dashboard', 'plug', 'server', 'shield', 'refresh', 'target', 'flask', 'link', 'gauge', 'lock', 'rocket',
  'factory', 'cart', 'cap', 'heart', 'truck', 'bank', 'building',
] as const

export const iconField = z.union([z.enum(ICONS), z.literal('')]).optional()

/**
 * Search and sharing fields.
 *
 * Limits are a little above what search engines display, as on the Zaavi CMS:
 * the editor shows the recommended length, and refusing a title for being two
 * characters over it helps nobody.
 */
export const seoSchema = z.object({
  metaTitle: optionalText(100, 'the meta title'),
  metaDescription: optionalText(220, 'the meta description'),
  canonicalUrl: optionalUrl(500),
  ogTitle: optionalText(200, 'the social title'),
  ogDescription: optionalText(320, 'the social description'),
  ogImage: mediaRef.nullish(),
  noIndex: z.boolean().optional(),
})

export type SeoInput = z.infer<typeof seoSchema>

/**
 * The publishing lifecycle shared by every content type.
 *
 * `scheduled` needs `publishAt`; the item is public from that moment without
 * anything having to run (see shared/publishing.ts).
 */
export const CONTENT_STATUSES = ['draft', 'published', 'scheduled', 'archived'] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]
export const statusField = z.enum(CONTENT_STATUSES)

/** An ISO timestamp, or '' / null to clear. */
export const publishAtField = z
  .union([z.iso.datetime({ offset: true, message: 'Choose a valid date and time.' }), z.literal(''), z.null()])
  .optional()

/** A calendar date, or '' for none. */
export const dateField = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date.'), z.literal('')])
  .optional()

/** Display order. */
export const sortOrderField = z.coerce.number().int().min(0).max(9999)

/**
 * Why each module's patch schema is its base schema `.partial()` with no
 * defaults, and defaults live only on the create schema.
 *
 * `.partial()` does NOT strip a `.default()` — `parse({ sortOrder: 5 })` would
 * still return `status: 'draft'`, so a drag-reorder that sends only the order
 * would silently unpublish the item. Keeping the base default-free makes that
 * impossible.
 */

export const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })
