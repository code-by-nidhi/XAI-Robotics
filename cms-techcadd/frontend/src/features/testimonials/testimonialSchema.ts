import { z } from 'zod'

/** Mirrors `backend/src/modules/testimonials/testimonials.schema.ts`. */
export const testimonialSchema = z.object({
  name: z.string().trim().min(1, 'A name is required.').max(120, 'Keep the name under 120 characters.'),
  role: z.string().trim().max(120, 'Keep the role under 120 characters.').optional(),
  company: z.string().trim().max(120, 'Keep the company under 120 characters.').optional(),
  quote: z.string().trim().min(1, 'A quote is required.').max(600, 'Keep the quote under 600 characters.'),
  /** null shows the quote without stars. */
  rating: z.number().int().min(1).max(5).nullable(),
  avatar: z
    .object({
      id: z.string(),
      url: z.string(),
      alt: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .nullable(),
  featured: z.boolean(),
  order: z.number().int().min(0).max(9999),
  status: z.enum(['published', 'draft']),
})

export type TestimonialFormValues = z.infer<typeof testimonialSchema>

export function emptyTestimonial(): TestimonialFormValues {
  return {
    name: '',
    role: '',
    company: '',
    quote: '',
    rating: 5,
    avatar: null,
    featured: false,
    order: 0,
    status: 'draft',
  }
}

export const TESTIMONIAL_STATUS_OPTIONS: { value: TestimonialFormValues['status']; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
]
