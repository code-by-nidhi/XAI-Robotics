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
const REVALIDATE_SECONDS = 300;

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

/** The FAQ section as it shipped; seeded into the CMS by migration 062. */
export const FALLBACK_FAQS: FaqItem[] = [
  { question: "Who can join the programme?", answer: "Students from Class 9 onwards, college students and early professionals who want to build real robots. Phase 1 starts from the fundamentals, so curiosity matters more than experience." },
  { question: "Do I need to know coding before I start?", answer: "No. Phase 1 teaches C/C++ and Python for embedded systems from the basics. Prior coding experience helps you move faster." },
  { question: "Is the project kit included in the programme fee?", answer: "The kit is purchased separately in Phase 2, and the finished robot is yours to keep." },
  { question: "How do I choose my Phase 2 project?", answer: "At the end of Phase 1, your mentor helps you pick one of the 12 projects based on your interests and skill level." },
  { question: "Is the R&D phase compulsory?", answer: "No. Phase 3 is optional and designed for students who want to research and build their own idea. Approved projects receive components from our lab." },
  { question: "Do you teach ROS, SolidWorks and OpenCV?", answer: "Yes. Phase 1 includes dedicated modules on embedded systems with FreeRTOS, SolidWorks CAD, OpenCV computer vision and ROS 2 with Gazebo simulation, and you apply them in your Phase 2 project." },
  { question: "Do I need to buy SolidWorks or other software?", answer: "No. You practise in our lab during the programme. Most other tools we use, including ROS 2, OpenCV, KiCad and Python, are free and open source." },
  { question: "Can I learn robotics online?", answer: "Phase 1 theory and programming can be followed in live online sessions. Building, testing and R&D need real hardware, so those phases take place in our robotics lab." },
  { question: "Is the lab safe for school students?", answer: "Yes. Soldering, battery handling and power tools are always supervised by mentors, and safe-practice training is part of Module 01." },
  { question: "Do I need my own laptop?", answer: "A laptop helps you practise coding at home and keep your project files. Ask our team about lab system availability for your batch." },
  { question: "Can my school or college book a robotics workshop?", answer: "Yes. We run robotics workshops, bootcamps and live demonstrations for schools, colleges and universities, and can set up a complete robotics lab through our franchise and B2B programme." },
  { question: "Will I receive a certificate?", answer: "Yes. Students who complete the programme receive an XAI Robotics certificate, along with a portfolio of their project work." },
];

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

/**
 * Every published FAQ, in the CMS's order.
 *
 * An empty list from a CMS that answered falls back too: a homepage section
 * with a heading and nothing under it is worse than the shipped questions.
 */
export async function getFaqs(): Promise<FaqItem[]> {
  const data = await read<{ items?: { question?: unknown; answer?: unknown }[] }>("/faqs");
  const items = (data?.items ?? [])
    .filter((f): f is FaqItem => typeof f.question === "string" && typeof f.answer === "string")
    .map(({ question, answer }) => ({ question, answer }));
  return items.length > 0 ? items : FALLBACK_FAQS;
}
