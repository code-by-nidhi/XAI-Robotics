import { z } from 'zod'

import {
  dateField,
  optionalText,
  publishAtField,
  richText,
  seoSchema,
  slugField,
  sortOrderField,
  statusField,
  stringList,
} from '../shared/content.schema.js'

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'internship'] as const
export const WORK_MODES = ['onsite', 'hybrid', 'remote'] as const

/** The wording the website shows, so it need not keep its own copy. */
export const EMPLOYMENT_LABELS: Record<(typeof EMPLOYMENT_TYPES)[number], string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}
export const WORK_MODE_LABELS: Record<(typeof WORK_MODES)[number], string> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
}

const items = (max: number, what: string) => stringList(max, 300, what)

const base = z.object({
  title: z.string().trim().min(1, 'Add a job title.').max(200, 'Keep the title under 200 characters.'),
  slug: slugField,
  department: optionalText(120, 'the department'),
  location: optionalText(160, 'the location'),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  workMode: z.enum(WORK_MODES),
  experience: optionalText(120, 'the experience'),
  salary: optionalText(120, 'the salary'),
  summary: z.string().trim().max(320, 'Keep the summary under 320 characters.'),
  description: richText,
  responsibilities: items(20, 'responsibilities'),
  requirements: items(20, 'requirements'),
  benefits: items(15, 'benefits'),
  /** Applications close after this day (inclusive). */
  closingDate: dateField,
  sortOrder: sortOrderField,
  status: statusField,
  publishAt: publishAtField,
  seo: seoSchema,
})

export const jobSchema = base.extend({
  employmentType: base.shape.employmentType.default('full_time'),
  workMode: base.shape.workMode.default('onsite'),
  summary: base.shape.summary.default(''),
  description: richText.default(''),
  responsibilities: base.shape.responsibilities.default([]),
  requirements: base.shape.requirements.default([]),
  benefits: base.shape.benefits.default([]),
  sortOrder: sortOrderField.default(0),
  status: statusField.default('draft'),
  seo: seoSchema.default({}),
})

/** Defaults stay off the patch schema — see the note in shared/content.schema.ts. */
export const jobPatchSchema = base.partial()

export type JobInput = z.infer<typeof jobSchema>
export type JobPatch = z.infer<typeof jobPatchSchema>
