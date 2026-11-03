"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Logo from "./Logo";
import { NAV_LINKS } from "./Nav";

export default function Footer({ onNavigate }: { onNavigate: (t: string) => void }) {
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
            <a href="#">LinkedIn</a>
            <a href="#">X / Twitter</a>
            <a href="#">YouTube</a>
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
