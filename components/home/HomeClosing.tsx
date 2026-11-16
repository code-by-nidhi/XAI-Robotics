"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { SiteSettings } from "@/lib/cms";

const SOCIAL: { key: keyof SiteSettings["social"]; label: string; path: string }[] = [
  { key: "facebook", label: "Facebook", path: "M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.2-.6.6-.6z" },
  { key: "x", label: "X", path: "M4 4l7.2 9.6L4.4 20h2.2l5.6-5.2L16.4 20H20l-7.6-10.1L18.8 4h-2.2l-5.1 4.8L7.6 4z" },
  { key: "linkedin", label: "LinkedIn", path: "M5 9h3v11H5zM6.5 4a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zM10 9h3v1.6c.5-.9 1.7-1.8 3.4-1.8 3.2 0 3.6 2.1 3.6 4.7V20h-3v-5.6c0-1.3 0-3-1.8-3s-2.2 1.4-2.2 2.9V20h-3z" },
  { key: "instagram", label: "Instagram", path: "M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5zm4 5a4 4 0 100 8 4 4 0 000-8zm5.2-1.6a1 1 0 100 2 1 1 0 000-2z" },
  { key: "youtube", label: "YouTube", path: "M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3z" },
];

export default function HomeClosing({ social }: { social: SiteSettings["social"] }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  // Only profiles set in the CMS; an empty or "#" link would go nowhere.
  const profiles = SOCIAL.filter(({ key }) => social[key] && social[key] !== "#");

  return (
    <section className="hm-closing" ref={root}>
      <div className="container">
        <h2 className="h2 rv">From India to the world</h2>
        <p className="mono rv" style={{ fontSize: "14px", color: "var(--accent)", marginTop: "12px", letterSpacing: "0.04em" }}>
          Engineer the Future. Build Intelligent Machines.
        </p>
        <p className="muted rv hm-closing-lede">
          From Robotics Education to Real-World Innovation — connecting Indian innovation with the possibilities of a rapidly advancing world.
        </p>
        {profiles.length > 0 && (
          <div className="hm-social rv">
            {profiles.map(({ key, label, path }) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d={path} fill="currentColor" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
