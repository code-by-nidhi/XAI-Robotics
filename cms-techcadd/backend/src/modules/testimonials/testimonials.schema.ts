import { z } from 'zod'

import { mediaRef, optionalText } from '../shared/content.schema.js'

/**
 * A testimonial. Mirrors `frontend/src/features/testimonials/testimonialSchema.ts`.
 *
 * Only the person's name and the quote are required. Role and company are
 * free text ('' clears them), the rating is optional — a partner school's
 * principal is quoted, not asked for stars — and the photo is an image slot:
 * absent leaves it alone, null removes it.
 */
const base = z.object({
  name: z.string().trim().min(1, 'A name is required.').max(120, 'Keep the name under 120 characters.'),
  role: optionalText(120, 'the role'),
  company: optionalText(120, 'the company'),
  quote: z.string().trim().min(1, 'A quote is required.').max(600, 'Keep the quote under 600 characters.'),
  rating: z
    .number()
    .int('Choose a whole number of stars.')
    .min(1, 'Choose between 1 and 5 stars.')
    .max(5, 'Choose between 1 and 5 stars.')
    .nullable()
    .optional(),
  avatar: mediaRef.nullish(),
  featured: z.boolean(),
  order: z.coerce.number().int().min(0).max(9999),
  status: z.enum(['published', 'draft']),
})

export const testimonialSchema = base.extend({
  featured: z.boolean().default(false),
  order: base.shape.order.default(0),
  status: base.shape.status.default('draft'),
})

/** Defaults stay off the patch schema — see the note in shared/content.schema.ts. */
export const testimonialPatchSchema = base.partial()

export type TestimonialInput = z.infer<typeof testimonialSchema>
export type TestimonialPatch = z.infer<typeof testimonialPatchSchema>
