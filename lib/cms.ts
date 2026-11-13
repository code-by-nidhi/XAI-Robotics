/**
 * Reading from the XAI Robotics CMS (cms-techcadd/backend, /api/public).
 *
 * Server-side reads are cached under the `cms` tag and refreshed when the CMS
 * calls /api/revalidate after a save, or after REVALIDATE_SECONDS at the
 * latest. Every read falls back to the content the site shipped with, so the
 * page still renders — unchanged — when the CMS is down or not configured.
 *
 * The contact form and the page-view beacon post from the browser instead
 * (see `cmsBrowserUrl`), because the CMS rate-limits by the visitor's IP.
 */

export const CMS_TAG = "cms";

/** Seconds a cached CMS answer is used before it is fetched again. */
const REVALIDATE_SECONDS = 60;

/** A CMS that does not answer in this long is treated as down. */
const TIMEOUT_MS = 4000;

/** The CMS names itself on every response; anything else is a different API. */
const EXPECTED_SITE = process.env.CMS_SITE ?? "xai";

/** Where the server reaches the API, e.g. http://localhost:4000/api. */
function serverBase(): string | null {
  const url = process.env.CMS_API_URL ?? process.env.NEXT_PUBLIC_CMS_API_URL;
  return url ? url.replace(/\/$/, "") : null;
}

/** Where the visitor's browser reaches the API. Inlined at build time. */
export function cmsBrowserUrl(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_CMS_API_URL;
  return base ? `${base.replace(/\/$/, "")}${path}` : null;
}

/* ------------------------------------------------------------------ */
/* Shapes                                                               */
/* ------------------------------------------------------------------ */

export interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    contactEmail: string;
    phone: string;
    /** First location line, printed as-is (e.g. "HQ — San Francisco, CA"). */
    address: string;
    /** Second location line (e.g. "LAB — Munich, DE"). */
    city: string;
    hours: string;
    /** Completes "our team replies …". */
    responseTime: string;
  };
  social: { linkedin: string; facebook: string; x: string; youtube: string; instagram: string };
  seo: { defaultTitle: string; defaultDescription: string; allowIndexing: boolean };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** What the site printed before the CMS existed; also the CMS's own defaults. */
export const FALLBACK_SITE: SiteSettings = {
  general: {
    siteName: "XAI Robotics",
    tagline: "Machines that perceive, reason and move",
    contactEmail: "hello@xairobotics.com",
    phone: "",
    address: "HQ — San Francisco, CA",
    city: "LAB — Munich, DE",
    hours: "",
    responseTime: "within 48 hours",
  },
  social: { linkedin: "", facebook: "", x: "", youtube: "", instagram: "" },
  seo: {
    defaultTitle: "XAI Robotics — Machines that perceive, reason and move",
    defaultDescription:
      "XAI Robotics engineers autonomous humanoids, manipulators, quadrupeds and aerial systems powered by embodied intelligence.",
    allowIndexing: true,
  },
};

/* ------------------------------------------------------------------ */
/* Reads                                                                */
/* ------------------------------------------------------------------ */

/** A public CMS read, or null for any failure (unset, down, slow, wrong site). */
async function read<T>(path: string): Promise<T | null> {
  const base = serverBase();
  if (!base) return null;
  try {
    const response = await fetch(`${base}/public${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const site = response.headers.get("x-cms-site");
    if (site && site !== EXPECTED_SITE) {
      console.warn(`[cms] ${base} is the "${site}" CMS, not "${EXPECTED_SITE}" — using built-in content.`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[cms] ${path} unavailable (${error instanceof Error ? error.message : String(error)}) — using built-in content.`);
    return null;
  }
}

/** Contact details, social links and SEO defaults — each field over the fallback. */
export async function getSite(): Promise<SiteSettings> {
  const data = await read<Partial<SiteSettings>>("/site");
  if (!data) return FALLBACK_SITE;
  return {
    general: { ...FALLBACK_SITE.general, ...data.general },
    social: { ...FALLBACK_SITE.social, ...data.social },
    seo: { ...FALLBACK_SITE.seo, ...data.seo },
  };
}

/** Every published FAQ, in the CMS's order (empty when the CMS is unavailable). */
export async function getFaqs(): Promise<FaqItem[]> {
  const data = await read<{ items?: { question?: unknown; answer?: unknown }[] }>("/faqs");
  const items = (data?.items ?? [])
    .filter((f): f is FaqItem => typeof f.question === "string" && typeof f.answer === "string")
    .map(({ question, answer }) => ({ question, answer }));
  return items;
}


/* ------------------------------------------------------------------ */
/* Content collections: blogs, case studies, portfolio, testimonials   */
/* ------------------------------------------------------------------ */

export interface Media {
  url: string;
  alt: string;
}
export interface Category {
  name: string;
  slug: string;
}
export interface Result {
  value: string;
  label: string;
}
export interface Seo {
  title: string | null;
  description: string | null;
  noIndex: boolean;
}

export interface PostCard {
  slug: string;
  title: string;
  excerpt: string;
  category: Category | null;
  tags: string[];
  readMinutes: number;
  cover: Media | null;
  author: { name: string; title: string | null } | null;
  publishedAt: string;
}
export interface Post extends PostCard {
  html: string;
  seo: Seo;
}

export interface CaseStudyCard {
  slug: string;
  title: string;
  client: string;
  industry: string;
  excerpt: string;
  cover: Media | null;
  duration: string | null;
  results: Result[];
  technologies: string[];
  category: Category | null;
  publishedAt: string;
}
export interface CaseStudy extends CaseStudyCard {
  overviewHtml: string;
  challengeHtml: string;
  approachHtml: string;
  solutionHtml: string;
  implementationHtml: string;
  testimonial: { text: string; name: string | null; role: string | null } | null;
  seo: Seo;
}

export interface PortfolioCard {
  slug: string;
  title: string;
  client: string | null;
  industry: string | null;
  category: Category | null;
  summary: string;
  cover: Media | null;
  featured: boolean;
  technologies: string[];
  /** Slug of the linked public case study, if any. */
  caseStudy: string | null;
  publishedAt: string;
}
export interface PortfolioItem extends PortfolioCard {
  descriptionHtml: string;
  results: Result[];
  team: string[];
  duration: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  seo: Seo;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
  avatar: Media | null;
}

/** A detail read: the item, a redirect to its current slug, or null (missing / CMS down). */
export type Detail<T> = { item: T } | { redirect: string } | null;

/** CMS upload URLs can be root-relative to the API's origin. */
function absoluteMedia<T extends Media | null>(media: T): T {
  if (!media || !media.url.startsWith("/")) return media;
  const base = serverBase();
  return (base ? { ...media, url: new URL(media.url, base).toString() } : media) as T;
}

/** Fix up the media fields every collection shares. */
function withMedia<T extends { cover?: Media | null; avatar?: Media | null }>(item: T): T {
  return {
    ...item,
    ...("cover" in item ? { cover: absoluteMedia(item.cover ?? null) } : {}),
    ...("avatar" in item ? { avatar: absoluteMedia(item.avatar ?? null) } : {}),
  };
}

async function list<T extends object>(path: string): Promise<T[]> {
  const data = await read<{ items?: T[] }>(path);
  return Array.isArray(data?.items) ? data.items.map((i) => withMedia(i)) : [];
}

/** One item by slug; the CMS answers an old slug with 301 + `{ redirect }`. */
async function detail<T extends object>(path: string): Promise<Detail<T>> {
  const base = serverBase();
  if (!base) return null;
  try {
    const response = await fetch(`${base}/public${path}`, {
      redirect: "manual",
      next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.status === 301) {
      const body = (await response.json()) as { redirect?: unknown };
      return typeof body.redirect === "string" ? { redirect: body.redirect } : null;
    }
    if (!response.ok) return null;
    return { item: withMedia((await response.json()) as T) };
  } catch (error) {
    console.warn(`[cms] ${path} unavailable (${error instanceof Error ? error.message : String(error)}).`);
    return null;
  }
}

const slugPath = (slug: string) => encodeURIComponent(slug);

export const getPosts = (pageSize = 24) => list<PostCard>(`/blogs?pageSize=${pageSize}`);
export const getPost = (slug: string) => detail<Post>(`/blogs/${slugPath(slug)}`);

export const getCaseStudies = (pageSize = 24) => list<CaseStudyCard>(`/case-studies?pageSize=${pageSize}`);
export const getCaseStudy = (slug: string) => detail<CaseStudy>(`/case-studies/${slugPath(slug)}`);

export const getPortfolio = (opts: { featured?: boolean; pageSize?: number } = {}) =>
  list<PortfolioCard>(`/portfolio?pageSize=${opts.pageSize ?? 24}${opts.featured ? "&featured=1" : ""}`);
export const getPortfolioItem = (slug: string) => detail<PortfolioItem>(`/portfolio/${slugPath(slug)}`);

export const getTestimonials = (opts: { featured?: boolean } = {}) =>
  list<Testimonial>(`/testimonials${opts.featured ? "?featured=1" : ""}`);
