/**
 * The fixed lists content is filed under.
 *
 * Categories and services used to be records an editor managed; they are now
 * part of the website's code, so the CMS only picks from them. The same lists
 * live in three places and must be changed together:
 *
 * - here,
 * - the API's backend/src/modules/shared/taxonomy.ts, which refuses any other
 *   value with a 422,
 * - the website's src/lib/site/services-data.ts, which renders them.
 *
 * Adding an entry here alone only offers editors a choice the server rejects.
 */

export interface TaxonomyCategory {
  slug: string
  name: string
}

export interface TaxonomyService {
  slug: string
  title: string
}

export const BLOG_CATEGORIES: readonly TaxonomyCategory[] = [
  { slug: 'ai-strategy', name: 'AI Strategy' },
  { slug: 'delivery', name: 'Delivery' },
  { slug: 'generative-ai', name: 'Generative AI' },
  { slug: 'security', name: 'Security' },
]

export const CASE_STUDY_CATEGORIES: readonly TaxonomyCategory[] = [
  { slug: 'automation-agents', name: 'Automation & Agents' },
  { slug: 'chatbots-assistants', name: 'Chatbots & Assistants' },
  { slug: 'generative-ai', name: 'Generative AI' },
  { slug: 'machine-learning-analytics', name: 'Machine Learning & Analytics' },
]

export const PORTFOLIO_CATEGORIES: readonly TaxonomyCategory[] = [
  { slug: 'automation-agents', name: 'Automation & Agents' },
  { slug: 'chatbots-assistants', name: 'Chatbots & Assistants' },
  { slug: 'cloud-infrastructure', name: 'Cloud & Infrastructure' },
  { slug: 'generative-ai', name: 'Generative AI' },
  { slug: 'machine-learning-analytics', name: 'Machine Learning & Analytics' },
]

/** In the order the website lists them. The slug is also the service page's URL. */
export const SERVICES: readonly TaxonomyService[] = [
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

export type CategoryList = readonly TaxonomyCategory[]

/**
 * The display name for a stored category slug.
 *
 * Falls back to the slug itself: a record saved before a category was renamed
 * or dropped should still show what it is filed under, not a blank cell.
 */
export function categoryName(list: CategoryList, slug?: string): string | undefined {
  if (!slug) return undefined
  return list.find((category) => category.slug === slug)?.name ?? slug
}

/** As `{ value, label }` pairs, the shape Select and filter dropdowns take. */
export function categoryOptions(list: CategoryList) {
  return list.map((category) => ({ value: category.slug, label: category.name }))
}

export const SERVICE_OPTIONS = SERVICES.map((service) => ({
  value: service.slug,
  label: service.title,
}))
