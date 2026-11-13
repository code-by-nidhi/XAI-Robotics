import type { ApplicationStatus, ContentStatus, EnquiryStatus, ReviewStatus } from './index'

/* ------------------------------------------------------------------ */
/* Shared                                                               */
/* ------------------------------------------------------------------ */

export interface BaseEntity {
  id: string
  /** ISO timestamp. */
  createdAt: string
  updatedAt: string
}

/**
 * A reference to an item in the media library.
 *
 * Image slots are typed `MediaRef | null` rather than just optional: absent
 * means "leave it alone" on a patch, and null means "remove it". `undefined`
 * cannot say the second, because JSON.stringify drops the key entirely.
 */
export interface MediaRef {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
}

/** Embedded in every module that surfaces on the public site. */
export interface SeoFields {
  metaTitle?: string
  metaDescription?: string
  /** Blogs only — the other types have no keywords column. */
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: MediaRef | null
  canonicalUrl?: string
  /** Asks search engines not to list this one page. */
  noIndex?: boolean
}

/** The site's icon set — mirrors ICONS in the API's shared/content.schema.ts. */
export const SITE_ICONS = [
  'spark', 'workflow', 'chart', 'chat', 'cloud', 'signal', 'compass', 'doc', 'text', 'bot', 'brain',
  'dashboard', 'plug', 'server', 'shield', 'refresh', 'target', 'flask', 'link', 'gauge', 'lock', 'rocket',
  'factory', 'cart', 'cap', 'heart', 'truck', 'bank', 'building',
] as const

export type SiteIcon = (typeof SITE_ICONS)[number]

/** A headline result: "40%" / "faster onboarding". */
export interface ResultItem {
  value: string
  label: string
}

/** A related record as the API embeds it next to its id. */
export interface LinkedRef {
  id: string
  name?: string
  title?: string
  slug?: string
}

/** Fields every scheduled-publishing content type shares. */
export interface Publishable {
  status: ContentStatus
  /** When a scheduled item goes live. A server timestamp, local time. */
  publishAt?: string
  /** When it first went live. Read-only. */
  publishedAt?: string
}

/** The CMS has a single role: an admin can do everything. */
export type UserRole = 'admin' | 'editor'

/* ------------------------------------------------------------------ */
/* Blogs                                                                */
/* ------------------------------------------------------------------ */

export interface Blog extends BaseEntity, Publishable {
  title: string
  slug: string
  authorId?: string
  /** Resolved by the API for display. Read-only. */
  author?: { id: string; name: string; title?: string }
  /** Slug from BLOG_CATEGORIES in config/taxonomy.ts. */
  category?: string
  /** Slug of the service page promoted beside the article — from SERVICES. */
  relatedService?: string
  tags: string[]
  coverImage?: MediaRef | null
  excerpt: string
  body: string
  readMinutes?: number
  views?: number
  seo: SeoFields
}

/* ------------------------------------------------------------------ */
/* Case studies                                                         */
/* ------------------------------------------------------------------ */

export interface CaseStudy extends BaseEntity, Publishable {
  title: string
  slug: string
  client: string
  industry: string
  excerpt: string
  overview: string
  challenge: string
  approach: string
  solution: string
  implementation: string
  results: ResultItem[]
  technologies: string[]
  duration?: string
  testimonialText?: string
  testimonialName?: string
  testimonialRole?: string
  icon?: SiteIcon | ''
  /** Slug from SERVICES in config/taxonomy.ts. */
  serviceSlug?: string
  /** Slug from CASE_STUDY_CATEGORIES in config/taxonomy.ts. */
  category?: string
  coverImage?: MediaRef | null
  sortOrder: number
  views?: number
  seo: SeoFields
}

/* ------------------------------------------------------------------ */
/* Portfolio                                                            */
/* ------------------------------------------------------------------ */

export interface PortfolioItem extends BaseEntity, Publishable {
  title: string
  slug: string
  client?: string
  industry?: string
  summary: string
  description: string
  /** Slug from PORTFOLIO_CATEGORIES in config/taxonomy.ts. Required to publish. */
  category?: string
  caseStudyId?: string
  caseStudy?: LinkedRef
  technologies: string[]
  team: string[]
  results: ResultItem[]
  projectUrl?: string
  githubUrl?: string
  duration?: string
  icon?: SiteIcon | ''
  coverImage?: MediaRef | null
  featured: boolean
  /** Shown on the site at all — independent of publishing. */
  state: 'active' | 'inactive'
  sortOrder: number
  seo: SeoFields
}

/* ------------------------------------------------------------------ */
/* Careers                                                              */
/* ------------------------------------------------------------------ */

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'
export type WorkMode = 'onsite' | 'hybrid' | 'remote'

export interface Job extends BaseEntity, Publishable {
  title: string
  slug: string
  department?: string
  location?: string
  employmentType: EmploymentType
  workMode: WorkMode
  experience?: string
  salary?: string
  summary: string
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  /** yyyy-MM-dd; applications close after this day. */
  closingDate?: string
  sortOrder: number
  /** How many applications it has received. Read-only. */
  applications?: number
  seo: SeoFields
}

export interface JobApplication extends BaseEntity {
  jobId?: string
  /** Kept on the application, so it survives the job being deleted. */
  jobTitle: string
  jobSlug?: string
  name: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  portfolioUrl?: string
  coverLetter?: string
  cv: { filename: string; mime: string; size: number }
  status: ApplicationStatus
  notes: string
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                            */
/* ------------------------------------------------------------------ */

export interface EnquiryNote {
  id: string
  author: string
  body: string
  createdAt: string
}

export interface EnquiryRecord extends BaseEntity {
  name: string
  email: string
  phone?: string
  company?: string
  /** The service the visitor picked on the contact form, as they saw it. */
  service?: string
  subject?: string
  message: string
  status: EnquiryStatus
  assigneeId?: string
  /** Resolved by the API for display. Read-only. */
  assignee?: { id: string; name: string }
  notes: EnquiryNote[]
}

/* ------------------------------------------------------------------ */
/* Media                                                                */
/* ------------------------------------------------------------------ */

export interface MediaItem extends BaseEntity {
  filename: string
  url: string
  mimeType: string
  /** Bytes. */
  size: number
  width?: number
  height?: number
  alt: string
  folder?: string
  /**
   * How many records currently show this file.
   *
   * Counted from the foreign keys that point at media, so it covers blog
   * covers, the site logo and the rest. Deleting a file in use does not break the page — the
   * reference is set to null — the picture simply stops appearing, which is
   * harder to notice than a broken image and worth warning about.
   */
  usageCount?: number
}

/* ------------------------------------------------------------------ */
/* SEO                                                                  */
/* ------------------------------------------------------------------ */

export interface Redirect extends BaseEntity {
  from: string
  to: string
  type: 301 | 302
  enabled: boolean
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export interface User extends BaseEntity {
  name: string
  /** Job title, printed under the name on articles they wrote. */
  title?: string
  /** Author bio for the article byline. */
  bio?: string
  email: string
  /**
   * What is actually typed at the sign-in screen.
   *
   * Derived from the email's local part when an account is created — see
   * users.repo. Read-only here: it is the account's identity, and renaming it
   * would lock somebody out mid-session.
   */
  username?: string
  role: UserRole
  avatar?: MediaRef | null
  active: boolean
  /**
   * Mock-only credential digest. Real authentication hashes and verifies on
   * the server — never trust a password check that runs in the browser.
   */
  passwordHash?: string
}

/* ------------------------------------------------------------------ */
/* Site settings — a singleton, not a collection                        */
/* ------------------------------------------------------------------ */

export interface GeneralSettings {
  siteName: string
  tagline: string
  contactEmail: string
  phone: string
  address: string
  city: string
  hours: string
  responseTime: string
}

/** Profile addresses for the footer. Empty hides the icon. */
export interface SocialLinks {
  linkedin: string
  facebook: string
  x: string
  youtube: string
  instagram: string
}

export interface SeoSettings {
  defaultTitle: string
  defaultDescription: string
  /** Off asks search engines to stay away — for a staging copy, say. */
  allowIndexing: boolean
}

export interface EmailSettings {
  /** Where lead and application alerts go. */
  alertEmail: string
  sendInquiryAlerts: boolean
  sendApplicationAlerts: boolean
}

/** The grouped singleton the API serves; each card saves its own group. */
export interface SiteSettings {
  general: GeneralSettings
  social: SocialLinks
  seo: SeoSettings
  email: EmailSettings
  /** The signed-in user, read-only. */
  profile: { name: string; email: string }
}

export interface SiteSettingsPatch {
  general?: Partial<GeneralSettings>
  social?: Partial<SocialLinks>
  seo?: Partial<SeoSettings>
  email?: Partial<EmailSettings>
}

/* ------------------------------------------------------------------ */
/* FAQs                                                                 */
/* ------------------------------------------------------------------ */

export interface Faq extends BaseEntity {
  question: string
  answer: string
  /** The category this is filed under. Required — see 038_faq_categories.sql. */
  categoryId?: string
  /**
   * The heading, by name.
   *
   * What the form edits and what the API resolves to a row — a name it does
   * not recognise becomes a new category.
   */
  categoryName?: string
  /** The resolved name, as the list pages display it. Read-only. */
  category?: string
  order: number
  /** The homepage shows a short selection rather than every question. */
  featured: boolean
  status: ReviewStatus
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                         */
/* ------------------------------------------------------------------ */

/** Who a testimonial is published as — no review workflow, see 063_testimonials.sql. */
export type TestimonialStatus = 'published' | 'draft'

export interface Testimonial extends BaseEntity {
  name: string
  /** e.g. "Programme graduate, Batch 2025", "Parent", "Franchise partner". */
  role?: string
  company?: string
  quote: string
  /** 1–5, or null for a quote shown without stars. */
  rating: number | null
  avatar: MediaRef | null
  /** The homepage shows the featured ones. */
  featured: boolean
  order: number
  status: TestimonialStatus
}
