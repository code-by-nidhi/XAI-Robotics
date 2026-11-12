import { z } from 'zod'

import type { JobCreate } from '../../api/resources/jobs'
import type { EmploymentType, Job, WorkMode } from '../../types'
import {
  optionalText,
  publishingShape,
  refinePublishing,
  seoSchema,
  slugSchema,
  stringListSchema,
  toDateTimeInput,
  toPublishAt,
} from '../shared/contentSchema'

/** Same wording as the website (EMPLOYMENT_LABELS / WORK_MODE_LABELS in the API). */
export const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

export const jobSchema = z
  .object({
    title: z.string().trim().min(1, 'Add a job title.').max(200, 'Keep the title under 200 characters.'),
    slug: slugSchema,
    department: optionalText(120, 'the department'),
    location: optionalText(160, 'the location'),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
    workMode: z.enum(['onsite', 'hybrid', 'remote']),
    experience: optionalText(120, 'the experience'),
    salary: optionalText(120, 'the salary'),
    summary: z.string().trim().max(320, 'Keep the summary under 320 characters.'),
    description: z.string(),
    responsibilities: stringListSchema(20, 300, 'responsibilities'),
    requirements: stringListSchema(20, 300, 'requirements'),
    benefits: stringListSchema(15, 300, 'benefits'),
    closingDate: z.string().optional(),
    sortOrder: z.number().int().min(0, 'Use 0 or more.').max(9999),
    ...publishingShape,
    seo: seoSchema,
  })
  .superRefine(refinePublishing)

export type JobFormValues = z.infer<typeof jobSchema>

export function emptyJob(): JobFormValues {
  return {
    title: '',
    slug: '',
    department: '',
    location: '',
    employmentType: 'full_time',
    workMode: 'onsite',
    experience: '',
    salary: '',
    summary: '',
    description: '',
    responsibilities: [],
    requirements: [],
    benefits: [],
    closingDate: '',
    sortOrder: 0,
    status: 'draft',
    publishAt: undefined,
    seo: {},
  }
}

export function jobToValues(record: Job): JobFormValues {
  return {
    ...emptyJob(),
    title: record.title,
    slug: record.slug,
    department: record.department ?? '',
    location: record.location ?? '',
    employmentType: record.employmentType,
    workMode: record.workMode,
    experience: record.experience ?? '',
    salary: record.salary ?? '',
    summary: record.summary ?? '',
    description: record.description ?? '',
    responsibilities: record.responsibilities ?? [],
    requirements: record.requirements ?? [],
    benefits: record.benefits ?? [],
    closingDate: record.closingDate ?? '',
    sortOrder: record.sortOrder ?? 0,
    status: record.status,
    publishAt: toDateTimeInput(record.publishAt),
    seo: record.seo ?? {},
  }
}

export function jobToPayload(values: JobFormValues): JobCreate {
  return {
    ...values,
    // The date picker clears to undefined, which JSON drops — '' is what
    // tells the API to remove a closing date.
    closingDate: values.closingDate ?? '',
    publishAt: toPublishAt(values.status, values.publishAt),
  }
}
