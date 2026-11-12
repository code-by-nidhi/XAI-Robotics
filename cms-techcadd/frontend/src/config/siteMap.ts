/**
 * Where each kind of content ends up on the public website.
 *
 * An editor filling in a form cannot tell, from the form alone, whether they
 * are writing something that appears on the homepage, on a page of its own, or
 * nowhere at all until a developer wires it up. That gap is where "I saved it
 * and nothing happened" comes from, so it is answered here in one place and
 * shown on every form.
 *
 * Keeping it as data rather than prose in each form means a module that is not
 * yet connected has to say so explicitly, instead of quietly omitting the note.
 */

/**
 * The public site. Set VITE_SITE_URL when it is not on the XAI Robotics
 * website's usual dev port (`next dev`, http://localhost:3000).
 */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://localhost:3000'
).replace(/\/$/, '')

export interface Placement {
  /** Where this content shows up, in a sentence an editor can act on. */
  where: string
  /**
   * The public URL of one record, when it has a page of its own.
   *
   * Undefined means the content appears inside other pages rather than at its
   * own address — an FAQ has no URL, a blog post does.
   */
  url?: (record: Record<string, unknown>) => string | undefined
  /**
   * Set when nothing on the website reads this yet.
   *
   * The honest alternative to leaving the module out of this map, which would
   * read as "no note needed" rather than "this goes nowhere".
   */
  notLive?: string
}

/** The site's address without the scheme, as slug fields print it. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '')

/**
 * The address prefix of each module that has a page per record.
 *
 * Mirrors the website's route folders (src/app/(site)/…).
 */
export const SITE_PATHS = {
  blogs: '/blog/',
  caseStudies: '/case-studies/',
  portfolio: '/portfolio/',
  jobs: '/careers/',
} as const

/** A record's public URL under `prefix`. Give a SITE_MAP entry `url: slugUrl(SITE_PATHS.x)` once the website has that page. */
export const slugUrl = (prefix: string) => (record: Record<string, unknown>) => {
  const slug = record.slug
  return typeof slug === 'string' && slug ? `${SITE_URL}${prefix}${slug}` : undefined
}

/*
  Keyed by nav item id. An entry is harmless until a form passes that key to
  AppearsOn — this map is read, never iterated.
*/
export const SITE_MAP: Record<string, Placement> = {
  /*
    The XAI Robotics website is a single page today. Blogs, case studies,
    portfolio and jobs are kept so content can be prepared ahead, but no page
    reads them yet — `url` is left off so nothing offers a link that 404s.
  */
  blogs: {
    where: 'A blog at /blog, once the website has one.',
    notLive: 'The XAI Robotics website has no blog page yet, so posts saved here are not shown to visitors.',
  },
  'case-studies': {
    where: 'A case studies page, once the website has one.',
    notLive: 'The XAI Robotics website has no case studies page yet, so nothing here is shown to visitors.',
  },
  portfolio: {
    where: 'A portfolio page, once the website has one.',
    notLive: 'The XAI Robotics website has no portfolio page yet, so nothing here is shown to visitors.',
  },
  jobs: {
    where: 'A careers page where candidates apply, once the website has one.',
    notLive: 'The XAI Robotics website has no careers page yet, so openings are not shown and nobody can apply.',
  },
  faqs: {
    where:
      'The "Frequently asked questions" section on the homepage. Every published question shows, in category order, then the order set here.',
  },
  settings: {
    where:
      'The homepage contact section (contact email, the two location lines from Address and City, the reply time) and the footer social links. The default title and description are the site’s search metadata.',
  },
  redirects: {
    where: 'Not applied yet: the website is a single page and does not read redirects.',
  },
  enquiries: {
    where: 'Received from the contact form at the bottom of the homepage. Nothing here is published back to it.',
  },
  media: {
    where: 'Used by whatever content references it — a cover image, a blog illustration, a logo.',
  },
  seo: {
    where: 'Meta titles and descriptions are used on the pages they belong to.',
  },
}

/**
 * The public address of one record, or undefined when it has none.
 *
 * Wraps the per-module `url` above so a caller does not have to know which
 * modules have their own page — a list page can offer "View on site" wherever
 * this returns something and omit it everywhere else, without carrying its own
 * copy of the site's URL shapes.
 */
export function publicUrlFor(module: string, record: object | undefined): string | undefined {
  if (!record) return undefined
  // Callers pass their own entity types (Blog, Page); the map's own url()
  // reads a couple of named fields off it and checks them, so an
  // index-signature cast here is safe and saves every caller a cast.
  return SITE_MAP[module]?.url?.(record as Record<string, unknown>)
}
