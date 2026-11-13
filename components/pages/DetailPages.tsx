"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { CaseStudy, PortfolioItem, Post, PostCard, Result } from "@/lib/cms";
import { Cover, PostCardView, formatDate } from "../ui/Cards";
import { CtaBand, Prose } from "../ui/Blocks";
import { useGoClick } from "../Shell";

/** Shared article shell: back link, eyebrow meta, title, lede, cover. */
function DetailHeader({
  back,
  meta,
  title,
  lede,
  cover,
}: {
  back: { label: string; href: string };
  meta: (string | null | undefined)[];
  title: string;
  lede?: string;
  cover: Post["cover"];
}) {
  const goClick = useGoClick();
  return (
    <header className="pg-detail-head" id="top">
      <div className="container pg-narrow">
        <a href={back.href} onClick={goClick(back.href)} className="pg-back mono">
          ← {back.label}
        </a>
        <div className="hm-post-meta mono rv">
          {meta.filter(Boolean).map((m, i) => (
            <span key={i} className={i === 0 ? "hm-tag" : undefined}>
              {m}
            </span>
          ))}
        </div>
        <h1 className="pg-detail-title rv">{title}</h1>
        {lede && <p className="pg-hero-lede rv">{lede}</p>}
      </div>
      <div className="container">
        <div className="pg-detail-cover rv">
          <Cover media={cover} />
        </div>
      </div>
    </header>
  );
}

function Results({ results }: { results: Result[] }) {
  if (results.length === 0) return null;
  return (
    <dl className="pg-results pg-results-lg rv">
      {results.map((r) => (
        <div key={r.label + r.value}>
          <dd>{r.value}</dd>
          <dt className="mono muted">{r.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function Chips({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="pg-side-block">
      <h4 className="mono muted">{title}</h4>
      <ul className="pg-chips">
        {items.map((t) => (
          <li key={t} className="mono">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Facts({ facts }: { facts: [string, string | null | undefined][] }) {
  const shown = facts.filter((f): f is [string, string] => Boolean(f[1]));
  if (shown.length === 0) return null;
  return (
    <dl className="pg-facts">
      {shown.map(([k, v]) => (
        <div key={k}>
          <dt className="mono muted">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function useDetailReveal() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return root;
}

export function CaseStudyDetail({ item }: { item: CaseStudy }) {
  const root = useDetailReveal();
  const sections = [
    ["Overview", item.overviewHtml],
    ["The challenge", item.challengeHtml],
    ["Our approach", item.approachHtml],
    ["The solution", item.solutionHtml],
    ["Implementation", item.implementationHtml],
  ].filter(([, html]) => html.trim());

  return (
    <main ref={root}>
      <DetailHeader
        back={{ label: "All case studies", href: "/case-studies" }}
        meta={[item.category?.name ?? "Case study", item.industry, item.duration]}
        title={item.title}
        lede={item.excerpt}
        cover={item.cover}
      />
      <section className="section pg-detail">
        <div className="container pg-detail-grid">
          <aside className="pg-side rv">
            <Facts
              facts={[
                ["Client", item.client],
                ["Industry", item.industry],
                ["Duration", item.duration],
              ]}
            />
            <Chips title="Technologies" items={item.technologies} />
          </aside>
          <div className="pg-detail-main">
            <Results results={item.results} />
            {sections.map(([title, html]) => (
              <div key={title} className="pg-chapter rv">
                <h2>{title}</h2>
                <Prose html={html} />
              </div>
            ))}
            {item.testimonial && (
              <figure className="pg-quote rv">
                <blockquote>“{item.testimonial.text}”</blockquote>
                {(item.testimonial.name || item.testimonial.role) && (
                  <figcaption className="mono muted">
                    {[item.testimonial.name, item.testimonial.role].filter(Boolean).join(" · ")}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </div>
      </section>
      <CtaBand title="Want results like these?" />
    </main>
  );
}

export function PortfolioDetail({ item }: { item: PortfolioItem }) {
  const root = useDetailReveal();
  const goClick = useGoClick();
  return (
    <main ref={root}>
      <DetailHeader
        back={{ label: "All projects", href: "/portfolio" }}
        meta={[item.category?.name ?? "Project", item.industry, item.duration]}
        title={item.title}
        lede={item.summary}
        cover={item.cover}
      />
      <section className="section pg-detail">
        <div className="container pg-detail-grid">
          <aside className="pg-side rv">
            <Facts
              facts={[
                ["Client", item.client],
                ["Industry", item.industry],
                ["Duration", item.duration],
              ]}
            />
            <Chips title="Technologies" items={item.technologies} />
            <Chips title="Team" items={item.team} />
            <div className="pg-side-links">
              {item.projectUrl && (
                <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="pg-more mono">
                  Live project ↗
                </a>
              )}
              {item.githubUrl && (
                <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="pg-more mono">
                  Source code ↗
                </a>
              )}
              {item.caseStudy && (
                <a
                  href={`/case-studies/${item.caseStudy}`}
                  onClick={goClick(`/case-studies/${item.caseStudy}`)}
                  className="pg-more mono"
                >
                  Read the case study →
                </a>
              )}
            </div>
          </aside>
          <div className="pg-detail-main">
            <Results results={item.results} />
            {item.descriptionHtml.trim() && (
              <div className="pg-chapter rv">
                <h2>About the project</h2>
                <Prose html={item.descriptionHtml} />
              </div>
            )}
          </div>
        </div>
      </section>
      <CtaBand title="Have a build in mind?" />
    </main>
  );
}

export function PostDetail({ post, more }: { post: Post; more: PostCard[] }) {
  const root = useDetailReveal();
  return (
    <main ref={root}>
      <DetailHeader
        back={{ label: "All articles", href: "/blogs" }}
        meta={[post.category?.name ?? "Article", formatDate(post.publishedAt), `${post.readMinutes} min read`]}
        title={post.title}
        lede={post.excerpt}
        cover={post.cover}
      />
      <section className="section pg-detail">
        <div className="container pg-narrow">
          <div className="rv">
            <Prose html={post.html} />
          </div>
          {(post.author || post.tags.length > 0) && (
            <footer className="pg-post-foot rv">
              {post.author && (
                <p>
                  <strong>{post.author.name}</strong>
                  {post.author.title && <span className="muted"> · {post.author.title}</span>}
                </p>
              )}
              {post.tags.length > 0 && (
                <ul className="pg-chips">
                  {post.tags.map((t) => (
                    <li key={t} className="mono">
                      #{t}
                    </li>
                  ))}
                </ul>
              )}
            </footer>
          )}
        </div>
      </section>
      {more.length > 0 && (
        <section className="section hm pg-more-posts">
          <div className="container">
            <div className="hm-center">
              <h2 className="h2 rv">Keep reading</h2>
            </div>
            <div className="hm-cards">
              {more.map((p) => (
                <PostCardView key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
