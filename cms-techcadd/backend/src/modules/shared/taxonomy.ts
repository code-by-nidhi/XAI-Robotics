import { z } from 'zod'

/**
 * The fixed lists content is filed against: categories per content type, and
 * the website's services.
 *
 * Kept in code rather than in tables because they change about once a year,
 * and because they mirror the XAI Robotics website — a CMS copy that could
 * be edited would only drift from it. Two copies have to agree, so a change
 * here means the same change in the CMS admin:
 * cms-techcadd/frontend/src/config/taxonomy.ts.
 *
 * SERVICES are the site's offerings, as its contact form's "I'm interested
 * in" list names them; categories follow its curriculum and its 12 builds.
 *
 * Content stores the slug. The names are what the website prints, so the
 * public API looks them up here rather than storing them on each row.
 */

export interface Category {
  slug: string
  name: string
}

export const BLOG_CATEGORIES: readonly Category[] = [
  { slug: 'robotics-engineering', name: 'Robotics Engineering' },
  { slug: 'embedded-systems', name: 'Embedded Systems' },
  { slug: 'ai-computer-vision', name: 'AI & Computer Vision' },
  { slug: 'ros-simulation', name: 'ROS & Simulation' },
  { slug: 'student-projects', name: 'Student Projects' },
  { slug: 'events-workshops', name: 'Events & Workshops' },
]

export const CASE_STUDY_CATEGORIES: readonly Category[] = [
  { slug: 'schools', name: 'Schools' },
  { slug: 'colleges-universities', name: 'Colleges & Universities' },
  { slug: 'franchise-partners', name: 'Franchise Partners' },
  { slug: 'industry-partners', name: 'Industry Partners' },
]

export const PORTFOLIO_CATEGORIES: readonly Category[] = [
  { slug: 'mobile-robots', name: 'Mobile Robots & Rovers' },
  { slug: 'robotic-arms', name: 'Robotic Arms & Manipulators' },
  { slug: 'legged-robots', name: 'Legged Robots' },
  { slug: 'balancing-control', name: 'Balancing & Control Systems' },
  { slug: 'aerial-systems', name: 'Aerial & Flight Systems' },
  { slug: 'swarm-autonomy', name: 'Swarm & Autonomy' },
]

/** XAI Robotics' offerings, in the contact form's order; `title` is what editors see. */
export const SERVICES: readonly { slug: string; title: string }[] = [
  { slug: 'robotics-programme', title: '6-Month Robotics Programme' },
  { slug: 'robotics-projects', title: 'Robotics Projects' },
  { slug: 'rnd-lab', title: 'R&D Lab' },
  { slug: 'workshops-events', title: 'Workshops & Events' },
  { slug: 'franchise-b2b', title: 'Franchise & B2B' },
  { slug: 'lab-tour', title: 'Free Lab Tour' },
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
