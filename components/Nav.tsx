"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Logo from "./Logo";

export const NAV_LINKS = [
  { label: "Systems", href: "#anatomy" },
  { label: "Fleet", href: "#fleet" },
  { label: "Programme", href: "#programme" },
  { label: "Projects", href: "#projects" },
  { label: "R&D Lab", href: "#rd" },
  { label: "Franchise", href: "#franchise" },
];

export default function Nav({ onNavigate }: { onNavigate: (target: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const show = gsap.quickTo(root.current, "yPercent", { duration: 0.5, ease: "power3.out" });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          root.current?.classList.toggle("is-scrolled", self.scroll() > 40);
          show(self.direction === 1 && self.scroll() > 200 ? -120 : 0);
        },
      });
    },
    { scope: root }
  );

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    onNavigate(href);
  };

  return (
    <header className={`nav ${open ? "is-open" : ""}`} ref={root}>
      <a href="#top" className="nav-logo" onClick={(e) => go(e, "#top")} aria-label="XAI Robotics home">
        <Logo />
      </a>
      <nav className="nav-links" aria-label="Primary">
        {NAV_LINKS.map((l, i) => (
          <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
            <span className="nav-idx">0{i + 1}</span>
            <span className="nav-label" data-text={l.label}>
              {l.label}
            </span>
          </a>
        ))}
      </nav>
      <a href="#contact" className="btn btn-ghost nav-cta" onClick={(e) => go(e, "#contact")}>
        <span className="btn-dot" /> Partner with us
      </a>
      <button
        className="nav-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
