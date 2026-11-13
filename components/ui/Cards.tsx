"use client";

import type { CaseStudyCard, Media, PortfolioCard, PostCard } from "@/lib/cms";
import { useGoClick } from "../Shell";

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatDate = (iso: string) => DATE.format(new Date(iso));

/** A CMS image, or the circuit placeholder when the item has none. */
export function Cover({ media }: { media: Media | null }) {
  return media ? (
    // CMS uploads live on another origin; a plain img avoids next/image domain config.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt={media.alt} loading="lazy" />
  ) : (
    <span className="hm-post-ph" aria-hidden="true" />
  );
}

export function PostCardView({ post }: { post: PostCard }) {
  const goClick = useGoClick();
  const href = `/blogs/${post.slug}`;
  return (
    <a href={href} onClick={goClick(href)} className="hm-post rv">
      <div className="hm-post-media">
        <Cover media={post.cover} />
      </div>
      <div className="hm-post-meta mono">
        {post.category && <span className="hm-tag">{post.category.name}</span>}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>
      <h3>{post.title}</h3>
      {post.excerpt && <p className="muted">{post.excerpt}</p>}
    </a>
  );
}

export function CaseStudyCardView({ item }: { item: CaseStudyCard }) {
  const goClick = useGoClick();
  const href = `/case-studies/${item.slug}`;
  return (
    <a href={href} onClick={goClick(href)} className="hm-post pg-case rv">
      <div className="hm-post-media">
        <Cover media={item.cover} />
      </div>
      <div className="hm-post-meta mono">
        {item.category && <span className="hm-tag">{item.category.name}</span>}
        {item.industry && <span>{item.industry}</span>}
      </div>
      <h3>{item.title}</h3>
      {item.excerpt && <p className="muted">{item.excerpt}</p>}
      {item.results.length > 0 && (
        <dl className="pg-results">
          {item.results.slice(0, 3).map((r) => (
            <div key={r.label + r.value}>
              <dd>{r.value}</dd>
              <dt className="mono muted">{r.label}</dt>
            </div>
          ))}
        </dl>
      )}
      <span className="pg-more mono">Read case study →</span>
    </a>
  );
}

export function PortfolioCardView({ item }: { item: PortfolioCard }) {
  const goClick = useGoClick();
  const href = `/portfolio/${item.slug}`;
  return (
    <a href={href} onClick={goClick(href)} className="hm-post rv">
      <div className="hm-post-media">
        <Cover media={item.cover} />
      </div>
      <div className="hm-post-meta mono">
        {item.category && <span className="hm-tag">{item.category.name}</span>}
        {item.featured && <span>Featured</span>}
      </div>
      <h3>{item.title}</h3>
      {item.summary && <p className="muted">{item.summary}</p>}
      {item.technologies.length > 0 && (
        <ul className="pg-chips">
          {item.technologies.slice(0, 4).map((t) => (
            <li key={t} className="mono">
              {t}
            </li>
          ))}
        </ul>
      )}
    </a>
  );
}

/** Shown in place of a list when the CMS returned nothing. */
export function Empty({ what }: { what: string }) {
  return (
    <div className="pg-empty rv">
      <p className="mono">No {what} published yet</p>
      <p className="muted">Check back soon — new {what} are added through the XAI Robotics CMS.</p>
    </div>
  );
}
