import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import type { Detail, Media, Seo } from "./cms";

/** The item, or a 308 to its current slug, or a 404. */
export function resolve<T>(result: Detail<T>, base: string): T {
  if (!result) notFound();
  if ("redirect" in result) permanentRedirect(`${base}/${encodeURIComponent(result.redirect)}`);
  return result.item;
}

/** Page metadata from an item's CMS SEO fields, falling back to its own title/summary. */
export function detailMetadata<T extends { title: string; seo: Seo; cover: Media | null }>(
  result: Detail<T>,
  summary: (item: T) => string
): Metadata {
  if (!result || "redirect" in result) return {};
  const { item } = result;
  return {
    title: item.seo.title ?? item.title,
    description: item.seo.description ?? summary(item),
    robots: item.seo.noIndex ? { index: false, follow: true } : undefined,
    openGraph: item.cover ? { images: [item.cover.url] } : undefined,
  };
}
