import { z } from 'zod'

/**
 * The four settings groups the XAI Robotics website reads, one schema each.
 *
 * Every field is required in the group's shape and every group optional in a
 * request: a settings card saves its own group, and the stored group is merged
 * over the defaults in settings.repo.ts, so a partial group on the way in is
 * still a complete one on the way out.
 */
const text = (max: number) => z.string().trim().max(max, `Use at most ${max} characters.`)

/**
 * A profile address, or nothing.
 *
 * Full URLs only. A bare handle was once accepted and rendered as a relative
 * link in the footer, which 404s. Empty removes the icon; "#" is the website's
 * own placeholder and is allowed through so its defaults survive a save.
 */
const profileUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || v === '#' || /^https:\/\/\S+$/.test(v), 'Use a full https:// link, or leave empty.')

export const generalSchema = z.object({
  siteName: text(120).min(1, 'Enter the company name.'),
  tagline: text(200),
  contactEmail: text(191),
  phone: text(60),
  address: text(300),
  city: text(120),
  hours: text(160),
  responseTime: text(80),
})

export const socialSchema = z.object({
  linkedin: profileUrl,
  facebook: profileUrl,
  x: profileUrl,
  youtube: profileUrl,
  instagram: profileUrl,
})

export const seoSettingsSchema = z.object({
  defaultTitle: text(70).min(1, 'Enter a default title.'),
  defaultDescription: text(170).min(1, 'Enter a default description.'),
  /** Off asks search engines to stay away — for a staging copy, say. */
  allowIndexing: z.boolean(),
})

export const emailSettingsSchema = z.object({
  alertEmail: z
    .string()
    .trim()
    .max(191)
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email address, or leave empty.'),
  sendInquiryAlerts: z.boolean(),
  sendApplicationAlerts: z.boolean(),
})

export const SETTINGS_SCHEMAS = {
  general: generalSchema,
  social: socialSchema,
  seo: seoSettingsSchema,
  email: emailSettingsSchema,
} as const

export type SettingsGroup = keyof typeof SETTINGS_SCHEMAS
export const SETTINGS_GROUPS = Object.keys(SETTINGS_SCHEMAS) as SettingsGroup[]
export type SettingsValues = { [K in SettingsGroup]: z.infer<(typeof SETTINGS_SCHEMAS)[K]> }

export const settingsPatchSchema = z.object({
  general: generalSchema.partial().optional(),
  social: socialSchema.partial().optional(),
  seo: seoSettingsSchema.partial().optional(),
  email: emailSettingsSchema.partial().optional(),
})

export type SettingsPatch = z.infer<typeof settingsPatchSchema>
