import { z } from 'zod'

import { optionalId } from '../shared/content.schema.js'

/** Zaavi's inquiry pipeline. Opening a new enquiry in the CMS marks it read. */
export const ENQUIRY_STATUSES = ['new', 'read', 'in_progress', 'resolved', 'archived'] as const

/**
 * A note on the timeline.
 *
 * `id` and `createdAt` are optional on the way in: the drawer generates both
 * for a note the user has just typed, but the server fills either gap so an
 * API caller can post `{ author, body }` alone.
 */
const enquiryNote = z.object({
  id: z.string().optional(),
  author: z.string().min(1, 'A note needs an author.'),
  body: z.string().min(1, 'A note cannot be empty.').max(5000, 'Keep notes under 5,000 characters.'),
  createdAt: z.string().optional(),
})

const optional = (max: number) => z.string().trim().max(max, `Use at most ${max} characters.`).optional()

const base = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.email('Enter a valid email address.').max(190),
  phone: optional(40),
  company: optional(160),
  service: optional(160),
  subject: optional(200),
  message: z.string().trim().min(1, 'A message is required.').max(5000, 'Keep the message under 5,000 characters.'),
  status: z.enum(ENQUIRY_STATUSES),
  assigneeId: optionalId,
  notes: z.array(enquiryNote),
})

/** Staff entering an enquiry by hand, e.g. one taken by phone. */
export const enquirySchema = base.extend({
  status: z.enum(ENQUIRY_STATUSES).default('new'),
  notes: z.array(enquiryNote).default([]),
})

/** Defaults stay off the patch schema — see the note in shared/content.schema.ts. */
export const enquiryPatchSchema = base.partial()

/** Bulk actions from the list: reassign or restatus a selection. */
export const enquiryBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Select at least one enquiry.'),
  status: z.enum(ENQUIRY_STATUSES).optional(),
  assigneeId: optionalId,
})

/**
 * What the website's contact form may send.
 *
 * Narrow on purpose: status, assignee and notes belong to the staff workflow,
 * and letting a form set them would let anyone file an enquiry as already
 * resolved or assign work to a colleague. `website` is a honeypot — hidden from
 * people, filled in by bots.
 */
const formText = (max: number) =>
  z.string().trim().max(max, `Use at most ${max} characters.`).optional().or(z.literal(''))

export const publicEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120, 'Use at most 120 characters.'),
  email: z.email('Enter a valid email address.').max(190),
  phone: formText(40),
  company: formText(160),
  service: formText(160),
  /**
   * Who is writing — the XAI Robotics form's "I am a" choice (Student, Parent,
   * Institution / Franchise enquiry, Industry partner). Stored as the subject.
   */
  role: formText(80),
  /**
   * Optional on the XAI Robotics form: picking who you are and what you are
   * interested in is already a complete enquiry. When given, it still has to
   * say something.
   */
  message: z
    .string()
    .trim()
    .max(5000, 'Keep your message under 5,000 characters.')
    .refine((value) => value === '' || value.length >= 10, 'Tell us a little more (at least 10 characters).')
    .default(''),
  website: z.string().max(500).optional(),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
export type EnquiryPatch = z.infer<typeof enquiryPatchSchema>
export type EnquiryBulk = z.infer<typeof enquiryBulkSchema>
export type EnquiryNoteInput = z.infer<typeof enquiryNote>
export type PublicEnquiry = z.infer<typeof publicEnquirySchema>
