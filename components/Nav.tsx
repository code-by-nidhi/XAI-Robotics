"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useGo, useServiceForm } from "./Shell";

/** Primary navigation — one page per item. */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blogs", href: "/blogs" },
];

/** Secondary links shown in the "more" (⋮) menu. */
const MORE_LINKS = [
  { label: "FAQs", href: "/about#faq" },
  { label: "Contact", href: "/contact" },
];

/** A link is active on its own page and on that page's detail pages. */
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const navigate = useGo();
  const openServiceForm = useServiceForm();

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Glass background once the page has scrolled past the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setOpen(false);
    navigate(href);
  };

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="nav-bar">
        <a href="/" className="nav-logo" onClick={(e) => go(e, "/")} aria-label="XAI Robotics home">
          <Logo />
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={isActive(pathname, l.href) ? "is-active" : undefined}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              onClick={(e) => go(e, l.href)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions" ref={menuRef}>
          <button
            type="button"
            className="nav-cta"
            onClick={() => {
              setOpen(false);
              openServiceForm();
            }}
          >
            Request a Service
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="nav-more"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="nav-menu" id="nav-menu" hidden={!open}>
            <div className="nav-menu-primary">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
                  {l.label}
                </a>
              ))}
            </div>
            {MORE_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
                {l.label}
              </a>
            ))}
            <button
              type="button"
              className="nav-menu-cta"
              onClick={() => {
                setOpen(false);
                openServiceForm();
              }}
            >
              Request a Service →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
