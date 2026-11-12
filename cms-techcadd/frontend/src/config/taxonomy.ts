/**
 * The fixed lists content is filed under.
 *
 * Categories and services used to be records an editor managed; they are now
 * part of the website's code, so the CMS only picks from them. The same lists
 * live in two places and must be changed together:
 *
 * - here,
 * - the API's backend/src/modules/shared/taxonomy.ts, which refuses any other
 *   value with a 422.
 *
 * They follow the XAI Robotics website: services are its offerings (the
 * contact form's "I'm interested in" list), categories its curriculum and builds.
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
  { slug: 'robotics-engineering', name: 'Robotics Engineering' },
  { slug: 'embedded-systems', name: 'Embedded Systems' },
  { slug: 'ai-computer-vision', name: 'AI & Computer Vision' },
  { slug: 'ros-simulation', name: 'ROS & Simulation' },
  { slug: 'student-projects', name: 'Student Projects' },
  { slug: 'events-workshops', name: 'Events & Workshops' },
]

export const CASE_STUDY_CATEGORIES: readonly TaxonomyCategory[] = [
  { slug: 'schools', name: 'Schools' },
  { slug: 'colleges-universities', name: 'Colleges & Universities' },
  { slug: 'franchise-partners', name: 'Franchise Partners' },
  { slug: 'industry-partners', name: 'Industry Partners' },
]

export const PORTFOLIO_CATEGORIES: readonly TaxonomyCategory[] = [
  { slug: 'mobile-robots', name: 'Mobile Robots & Rovers' },
  { slug: 'robotic-arms', name: 'Robotic Arms & Manipulators' },
  { slug: 'legged-robots', name: 'Legged Robots' },
  { slug: 'balancing-control', name: 'Balancing & Control Systems' },
  { slug: 'aerial-systems', name: 'Aerial & Flight Systems' },
  { slug: 'swarm-autonomy', name: 'Swarm & Autonomy' },
]

/** XAI Robotics' offerings, in the order the contact form lists them. */
export const SERVICES: readonly TaxonomyService[] = [
  { slug: 'robotics-programme', title: '6-Month Robotics Programme' },
  { slug: 'robotics-projects', title: 'Robotics Projects' },
  { slug: 'rnd-lab', title: 'R&D Lab' },
  { slug: 'workshops-events', title: 'Workshops & Events' },
  { slug: 'franchise-b2b', title: 'Franchise & B2B' },
  { slug: 'lab-tour', title: 'Free Lab Tour' },
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
