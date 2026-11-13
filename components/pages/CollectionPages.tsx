"use client";

import { useMemo, useState } from "react";
import type { CaseStudyCard, Category, PortfolioCard, PostCard } from "@/lib/cms";
import { CaseStudyCardView, Empty, PortfolioCardView, PostCardView, Cover, formatDate } from "../ui/Cards";
import { CtaBand, PageHero, Section } from "../ui/Blocks";
import { useGoClick } from "../Shell";

/** Category tabs for a list; only categories that have items. */
function useCategoryFilter<T extends { category: Category | null }>(items: T[]) {
  const [active, setActive] = useState<string>("all");
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const i of items) if (i.category) seen.set(i.category.slug, i.category.name);
    return [...seen].map(([slug, name]) => ({ slug, name }));
  }, [items]);
  const visible = active === "all" ? items : items.filter((i) => i.category?.slug === active);

  const tabs =
    categories.length > 1 ? (
      <div className="pg-tabs" role="tablist" aria-label="Filter by category">
        {[{ slug: "all", name: "All" }, ...categories].map((c) => (
          <button
            key={c.slug}
            role="tab"
            aria-selected={active === c.slug}
            className={active === c.slug ? "is-active" : undefined}
            onClick={() => setActive(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
    ) : null;

  return { visible, tabs };
}

export function CaseStudiesPage({ items }: { items: CaseStudyCard[] }) {
  const { visible, tabs } = useCategoryFilter(items);
  return (
    <main>
      <PageHero
        eyebrow="Case studies"
        title="Case studies"
        lede="How schools, colleges, partners and students used XAI Robotics to build real robots and real capability."
        actions={[{ label: "Request a Service", service: true }]}
      />
      <Section>
        {tabs}
        {visible.length > 0 ? (
          <div className="hm-cards">
            {visible.map((c) => (
              <CaseStudyCardView key={c.slug} item={c} />
            ))}
          </div>
        ) : (
          <Empty what="case studies" />
        )}
      </Section>
      <CtaBand title="Want results like these?" />
    </main>
  );
}

export function PortfolioPage({ items }: { items: PortfolioCard[] }) {
  const { visible, tabs } = useCategoryFilter(items);
  return (
    <main>
      <PageHero
        eyebrow="Portfolio"
        title="Our portfolio"
        lede="Robots, labs and prototypes built by our engineers and students — each one designed, wired, coded and tested by hand."
        actions={[{ label: "Request a Service", service: true }]}
      />
      <Section>
        {tabs}
        {visible.length > 0 ? (
          <div className="hm-cards">
            {visible.map((p) => (
              <PortfolioCardView key={p.slug} item={p} />
            ))}
          </div>
        ) : (
          <Empty what="projects" />
        )}
      </Section>
      <CtaBand title="Have a build in mind?" />
    </main>
  );
}

function FeaturedPost({ post }: { post: PostCard }) {
  const goClick = useGoClick();
  const href = `/blogs/${post.slug}`;
  return (
    <a href={href} onClick={goClick(href)} className="pg-feature rv">
      <div className="pg-feature-media">
        <Cover media={post.cover} />
      </div>
      <div className="pg-feature-body">
        <div className="hm-post-meta mono">
          {post.category && <span className="hm-tag">{post.category.name}</span>}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span>{post.readMinutes} min read</span>
        </div>
        <h2>{post.title}</h2>
        {post.excerpt && <p className="muted">{post.excerpt}</p>}
        <span className="pg-more mono">Read article →</span>
      </div>
    </a>
  );
}

export function BlogsPage({ posts }: { posts: PostCard[] }) {
  const { visible, tabs } = useCategoryFilter(posts);
  const [first, ...rest] = visible;
  return (
    <main>
      <PageHero
        eyebrow="Blog"
        title="Articles & resources"
        lede="Build logs, tutorials, event recaps and news from the XAI Robotics lab."
      />
      <Section>
        {tabs}
        {first ? (
          <>
            <FeaturedPost post={first} />
            {rest.length > 0 && (
              <div className="hm-cards pg-after-feature">
                {rest.map((p) => (
                  <PostCardView key={p.slug} post={p} />
                ))}
              </div>
            )}
          </>
        ) : (
          <Empty what="articles" />
        )}
      </Section>
    </main>
  );
}
