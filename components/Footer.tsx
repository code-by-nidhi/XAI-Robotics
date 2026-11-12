"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Logo from "./Logo";
import { NAV_LINKS } from "./Nav";
import type { SiteSettings } from "@/lib/cms";

/** Settings → Social, in the order the footer lists them. */
const SOCIAL: { key: keyof SiteSettings["social"]; label: string }[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X / Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
];

export default function Footer({
  onNavigate,
  social,
}: {
  onNavigate: (t: string) => void;
  social: SiteSettings["social"];
}) {
  // Only profiles set in the CMS; an empty or "#" link would go nowhere.
  const profiles = SOCIAL.filter(({ key }) => social[key] && social[key] !== "#");

  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".ft-big span", {
        yPercent: 100,
        opacity: 0,
        stagger: 0.05,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".ft-big", start: "top 95%" },
      });
    },
    { scope: root }
  );

  return (
    <footer className="footer" ref={root}>
      <div className="container">
        <div className="ft-top">
          <Logo />
          <nav className="ft-links" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(l.href);
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ft-links">
            {profiles.map(({ key, label }) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
            <a href="#">Careers</a>
          </div>
        </div>
        <p className="ft-big" aria-hidden="true">
          {"XAI ROBOTICS".split("").map((c, i) => (
            <span key={i}>{c === " " ? " " : c}</span>
          ))}
        </p>
        <div className="ft-bottom mono muted">
          <span>© 2026 XAI Robotics · An initiative of the techcadd ecosystem</span>
          <span>
            <span className="pulse" /> All systems operational
          </span>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("#top");
            }}
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
