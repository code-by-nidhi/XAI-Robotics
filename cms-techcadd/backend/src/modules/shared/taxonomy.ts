import { z } from 'zod'

/**
 * The fixed lists content is filed against: categories per content type, and
 * the website's services.
 *
 * Kept in code rather than in tables because they change about once a year,
 * and because the website owns the services themselves
 * (src/lib/site/services-data.ts on the site) — a CMS copy that could be
 * edited would only drift from it. Three copies have to agree, so a change
 * here means the same change in:
 *   - the website:   src/lib/site/services-data.ts (the services)
 *   - the CMS admin: cms-techcadd/frontend/src/config/taxonomy.ts (everything)
 *
 * Content stores the slug. The names are what the website prints, so the
 * public API looks them up here rather than storing them on each row.
 */

export interface Category {
  slug: string
  name: string
}

export const BLOG_CATEGORIES: readonly Category[] = [
  { slug: 'ai-strategy', name: 'AI Strategy' },
  { slug: 'delivery', name: 'Delivery' },
  { slug: 'generative-ai', name: 'Generative AI' },
  { slug: 'security', name: 'Security' },
]

export const CASE_STUDY_CATEGORIES: readonly Category[] = [
  { slug: 'automation-agents', name: 'Automation & Agents' },
  { slug: 'chatbots-assistants', name: 'Chatbots & Assistants' },
  { slug: 'generative-ai', name: 'Generative AI' },
  { slug: 'machine-learning-analytics', name: 'Machine Learning & Analytics' },
]

export const PORTFOLIO_CATEGORIES: readonly Category[] = [
  { slug: 'automation-agents', name: 'Automation & Agents' },
  { slug: 'chatbots-assistants', name: 'Chatbots & Assistants' },
  { slug: 'cloud-infrastructure', name: 'Cloud & Infrastructure' },
  { slug: 'generative-ai', name: 'Generative AI' },
  { slug: 'machine-learning-analytics', name: 'Machine Learning & Analytics' },
]

/** The website's service pages, in its menu order; `title` is the menu name. */
export const SERVICES: readonly { slug: string; title: string }[] = [
  { slug: 'ai-consulting', title: 'AI Consulting' },
  { slug: 'generative-ai-solutions', title: 'Generative AI' },
  { slug: 'ai-automation', title: 'AI Automation & Agents' },
  { slug: 'machine-learning', title: 'Machine Learning & Predictive Analytics' },
  { slug: 'ai-chatbot-development', title: 'AI Chatbots' },
  { slug: 'rag-solutions', title: 'RAG Knowledge Assistants' },
  { slug: 'ai-integration', title: 'AI Integration' },
  { slug: 'cloud-services', title: 'Cloud Infrastructure & Migration' },
  { slug: 'telecom-solutions', title: 'Telecom & Network Optimisation' },
]

/** A slug from `list`, or '' for none — the form sends '' to clear it. */
function oneOf(slugs: readonly string[], message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || slugs.includes(value), message)
    .optional()
}

export const categoryField = (list: readonly Category[]) =>
  oneOf(
    list.map((c) => c.slug),
    'Choose one of the listed categories.',
  )

export const serviceField = oneOf(
  SERVICES.map((s) => s.slug),
  'Choose one of the listed services.',
)

/** The public `{ name, slug }` for a stored slug; null when unset or no longer listed. */
export function publicCategory(list: readonly Category[], slug: unknown): Category | null {
  if (typeof slug !== 'string' || !slug) return null
  const found = list.find((c) => c.slug === slug)
  return found ? { name: found.name, slug: found.slug } : null
}

/** A category filter from the website, by slug or by name, as the slug to match. */
export function categorySlug(list: readonly Category[], value: string): string {
  return list.find((c) => c.slug === value || c.name === value)?.slug ?? value
}
