"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useDraw } from "./useDraw";
import { Quadruped } from "../RobotArt";
import type { PortfolioCard } from "@/lib/cms";
import { Empty } from "../ui/Cards";

/** The first featured portfolio item from the CMS. */
export default function HomePortfolio({
  item,
  onNavigate,
}: {
  item: PortfolioCard | null;
  onNavigate: (t: string) => void;
}) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useDraw(root);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };
  if (!item) {
    return (
      <section className="section hm" id="portfolio" ref={root}>
        <div className="container">
          <div className="hm-center">
            <span className="section-tag rv">Portfolio</span>
            <h2 className="h2 rv">Featured build</h2>
          </div>
          <Empty what="projects" />
        </div>
      </section>
    );
  }

  const href = `/portfolio/${item.slug}`;
  const specs: [string, string][] = [
    ["Client", item.client ?? ""],
    ["Industry", item.industry ?? ""],
    ["Category", item.category?.name ?? ""],
    ["Stack", item.technologies.slice(0, 3).join(", ")],
  ].filter((s): s is [string, string] => Boolean(s[1]));

  return (
    <section className="section hm" id="portfolio" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Portfolio</span>
          <h2 className="h2 rv">Featured build</h2>
          <p className="muted rv">A highlight from the robots, labs and projects we have delivered.</p>
        </div>

        <article className="hm-model rv">
          <div className="hm-model-media">
            {item.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.cover.url} alt={item.cover.alt} className="hm-model-img" />
            ) : (
              <Quadruped />
            )}
          </div>
          <div className="hm-model-body">
            {item.category && <span className="hm-tag mono">{item.category.name}</span>}
            <h3>{item.title}</h3>
            {item.summary && <p className="muted">{item.summary}</p>}
            {specs.length > 0 && (
              <dl className="hm-specs">
                {specs.map(([k, v]) => (
                  <div key={k}>
                    <dt className="mono muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="hm-actions">
              <a href={href} className="btn btn-primary" onClick={(e) => go(e, href)}>
                View project <span aria-hidden>→</span>
              </a>
              <a href="/portfolio" className="btn btn-ghost" onClick={(e) => go(e, "/portfolio")}>
                <span className="btn-dot" /> All projects
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
