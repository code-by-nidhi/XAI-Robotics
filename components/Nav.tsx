"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useGo, useServiceForm } from "./Shell";

export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

/** Primary navigation — supports nested dropdowns. */
export const NAV_LINKS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about-us",
    children: [
      { label: "About us", href: "/about-us", description: "Our story, ecosystem & philosophy" },
      { label: "Mission & Vision", href: "/mission-vision", description: "7 mission pillars & strategic vision" },
      { label: "Founder", href: "/founder", description: "Visionary leadership & techcadd roots" },
      { label: "Chi-chi", href: "/chi-chi", description: "The AI robot dog prototype from August 2025" },
    ],
  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blogs", href: "/blogs" },
];

/** Secondary links shown in the "more" (⋮) menu. */
const MORE_LINKS = [
  { label: "FAQs", href: "/about-us#faq" },
  { label: "Contact", href: "/contact" },
];

/** A link is active on its own page and on that page's detail pages. */
const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  if (href === "/about-us" || href === "/about") {
    return pathname === "/about" || pathname === "/about-us";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

/** Checks if a parent nav item or any of its children are currently active. */
const isParentActive = (pathname: string, item: NavItem) => {
  if (isActive(pathname, item.href)) return true;
  if (item.children) {
    return item.children.some((c) => isActive(pathname, c.href));
  }
  return false;
};

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const navigate = useGo();
  const openServiceForm = useServiceForm();

  // Close menus whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Glass background once the page has scrolled past the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu / dropdown on outside click or Escape.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dropdownOpen]);

  const go = (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setOpen(false);
    setDropdownOpen(false);
    navigate(href);
  };

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="nav-bar">
        <a href="/" className="nav-logo" onClick={(e) => go(e, "/")} aria-label="XAI Robotics home">
          <Logo />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            if (l.children) {
              const active = isParentActive(pathname, l);
              return (
                <div
                  key={l.href}
                  ref={dropdownRef}
                  className={`nav-dropdown${dropdownOpen ? " is-open" : ""}`}
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <a
                    href={l.href}
                    className={`nav-dropdown-trigger${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    onClick={(e) => go(e, l.href)}
                  >
                    <span>{l.label}</span>
                    <svg
                      className={`nav-caret${dropdownOpen ? " is-open" : ""}`}
                      viewBox="0 0 12 12"
                      width="9"
                      height="9"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>

                  {/* Dropdown Menu */}
                  <div className="nav-dropdown-menu" role="menu">
                    <div className="nav-dropdown-inner">
                      {l.children.map((sub) => {
                        const subActive = isActive(pathname, sub.href);
                        return (
                          <a
                            key={sub.href}
                            href={sub.href}
                            role="menuitem"
                            className={`nav-dropdown-link${subActive ? " is-active" : ""}`}
                            onClick={(e) => go(e, sub.href)}
                          >
                            <div className="nav-dropdown-link-head">
                              <span className="nav-dropdown-link-label">{sub.label}</span>
                              {subActive && <span className="nav-dropdown-link-dot" />}
                            </div>
                            {sub.description && (
                              <span className="nav-dropdown-link-desc">{sub.description}</span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const active = isActive(pathname, l.href);
            return (
              <a
                key={l.href}
                href={l.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={(e) => go(e, l.href)}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        {/* Navigation Actions (CTA & Mobile Menu Trigger) */}
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
              <path
                d="M2 8h11M9 4l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

          {/* Mobile & Overflow Menu */}
          <div className="nav-menu" id="nav-menu" hidden={!open}>
            <div className="nav-menu-primary">
              {NAV_LINKS.map((l) => {
                if (l.children) {
                  return (
                    <div key={l.href} className="nav-mobile-dropdown">
                      <div className="nav-mobile-dropdown-header">
                        <a
                          href={l.href}
                          className={`nav-mobile-parent${isParentActive(pathname, l) ? " is-active" : ""}`}
                          onClick={(e) => go(e, l.href)}
                        >
                          {l.label}
                        </a>
                        <button
                          type="button"
                          className="nav-mobile-toggle"
                          aria-label="Toggle About submenu"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileAboutOpen((prev) => !prev);
                          }}
                        >
                          <svg
                            className={`nav-caret${mobileAboutOpen ? " is-open" : ""}`}
                            viewBox="0 0 12 12"
                            width="11"
                            height="11"
                            aria-hidden="true"
                          >
                            <path
                              d="M2.5 4.5L6 8L9.5 4.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                      {mobileAboutOpen && (
                        <div className="nav-mobile-sub">
                          {l.children.map((sub) => (
                            <a
                              key={sub.href}
                              href={sub.href}
                              className={`nav-mobile-sublink${isActive(pathname, sub.href) ? " is-active" : ""}`}
                              onClick={(e) => go(e, sub.href)}
                            >
                              <span className="nav-mobile-sublink-bullet">›</span>
                              <span>{sub.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={isActive(pathname, l.href) ? "is-active" : undefined}
                    onClick={(e) => go(e, l.href)}
                  >
                    {l.label}
                  </a>
                );
              })}
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
