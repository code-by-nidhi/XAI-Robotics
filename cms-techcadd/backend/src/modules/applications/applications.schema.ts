import { z } from 'zod'

/** The hiring pipeline. */
export const APPLICATION_STATUSES = [
  'new', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'archived',
] as const

/** Staff may move an application along and keep notes; the submission itself is the applicant's. */
export const applicationPatchSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  notes: z.string().max(5000, 'Keep notes under 5,000 characters.').optional(),
})

const optional = (max: number, label: string) =>
  z.string().trim().max(max, `Keep ${label} under ${max} characters.`).optional().or(z.literal(''))

const link = z
  .string()
  .trim()
  .max(300)
  .regex(/^https?:\/\/\S+$/, 'Enter a full link starting with https://')
  .optional()
  .or(z.literal(''))

/**
 * The website's application form — multipart fields; the CV is checked
 * separately, by content. `website` is a honeypot.
 */
export const publicApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120, 'Use at most 120 characters.'),
  email: z.email('Enter a valid email address.').max(190),
  phone: optional(40, 'the phone number'),
  location: optional(160, 'your location'),
  linkedinUrl: link,
  portfolioUrl: link,
  coverLetter: optional(5000, 'the cover letter'),
  website: z.string().max(500).optional(),
})

export type ApplicationPatch = z.infer<typeof applicationPatchSchema>
export type PublicApplication = z.infer<typeof publicApplicationSchema>
