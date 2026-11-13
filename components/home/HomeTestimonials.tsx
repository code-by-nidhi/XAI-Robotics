"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { Testimonial } from "@/lib/cms";
import { Empty } from "../ui/Cards";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Testimonials from the CMS, as a looping marquee. */
export default function HomeTestimonials({
  items,
  title = "Hear what people say about us",
}: {
  items: Testimonial[];
  title?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // The list is rendered twice so the CSS marquee can loop seamlessly.
  const loop = [...items, ...items];

  return (
    <section className="section hm" id="testimonials" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Testimonials</span>
          <h2 className="h2 rv">{title}</h2>
          <p className="muted rv">
            Students, parents and partners on building robots with XAI Robotics.
          </p>
        </div>
        {items.length === 0 && <Empty what="testimonials" />}
      </div>

      {items.length > 0 && (
        <div className="hm-marquee rv">
          <ul className="hm-marquee-track">
            {loop.map((t, i) => (
              <li
                key={`${t.id}-${i}`}
                className="hm-quote"
                aria-hidden={i >= items.length || undefined}
              >
                <p>“{t.quote}”</p>
                <div className="hm-quote-by">
                  {t.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="hm-avatar"
                      src={t.avatar.url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span className="hm-avatar" aria-hidden="true">
                      {initials(t.name)}
                    </span>
                  )}
                  <span>
                    <strong>{t.name}</strong>
                    {(t.role || t.company) && (
                      <span className="muted">
                        {[t.role, t.company].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
