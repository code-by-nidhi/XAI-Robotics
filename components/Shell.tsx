"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cmsBrowserUrl, type SiteSettings } from "@/lib/cms";
import Cursor from "./Cursor";
import Nav from "./Nav";
import Footer from "./Footer";
import ServiceModal from "./ServiceModal";

/** Opens the "Request a service" pop-up from anywhere, optionally preselecting a service. */
const ServiceFormContext = createContext<(service?: string | unknown) => void>(() => {});
export const useServiceForm = () => useContext(ServiceFormContext);

/** The pop-up opens by itself on every full page load (including a refresh), shortly after render. */
const AUTO_OPEN_DELAY_MS = 1200;

type Go = (href: string) => void;
const GoContext = createContext<Go>(() => {});

/**
 * Navigate anywhere on the site: `#id` smooth-scrolls on the current page,
 * `/#id` does the same when already on the homepage, anything else is a
 * client-side route change.
 */
export const useGo = () => useContext(GoContext);

/**
 * Page scroll lock, held per reason ("intro" video, "modal", …). Scrolling is
 * stopped while any reason holds it. `unlockAll()` releases every hold; any
 * explicit navigation through `useGo` releases the intro hold first.
 */
export type ScrollLock = {
  lock: (reason: string) => void;
  unlock: (reason: string) => void;
  unlockAll: () => void;
  /** With a reason: is that reason holding? Without: is anything holding? */
  isLocked: (reason?: string) => boolean;
  /** Scroll even while locked (used to bring the locked section into view). */
  scrollTo: (target: HTMLElement | number, opts?: { offset?: number; duration?: number }) => void;
  /** Called whenever any hold changes; returns an unsubscribe. */
  subscribe: (fn: () => void) => () => void;
};
const noopLock: ScrollLock = {
  lock: () => {},
  unlock: () => {},
  unlockAll: () => {},
  isLocked: () => false,
  scrollTo: () => {},
  subscribe: () => () => {},
};
const LockContext = createContext<ScrollLock>(noopLock);
export const useScrollLock = () => useContext(LockContext);

/** Click handler for an <a> that should go through `useGo`. */
export function useGoClick() {
  const go = useGo();
  return (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(href);
  };
}

/** Site chrome shared by every page: smooth scroll, cursor, nav, footer, page-view beacon. */
export default function Shell({ site, children }: { site: SiteSettings; children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const holds = useRef(new Set<string>());
  const listeners = useRef(new Set<() => void>());
  const pathname = usePathname();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  const scrollLock = useMemo<ScrollLock>(() => {
    const apply = () => {
      const locked = holds.current.size > 0;
      if (locked) lenisRef.current?.stop();
      else lenisRef.current?.start();
      document.documentElement.classList.toggle("scroll-locked", locked);
      listeners.current.forEach((fn) => fn());
    };
    return {
      lock: (reason) => {
        if (holds.current.has(reason)) return;
        holds.current.add(reason);
        apply();
      },
      unlock: (reason) => {
        if (!holds.current.delete(reason)) return;
        apply();
      },
      unlockAll: () => {
        if (holds.current.size === 0) return;
        holds.current.clear();
        apply();
      },
      isLocked: (reason) => (reason ? holds.current.has(reason) : holds.current.size > 0),
      scrollTo: (target, opts = {}) =>
        lenisRef.current?.scrollTo(target, { offset: opts.offset ?? 0, duration: opts.duration ?? 1.2, force: true }),
      subscribe: (fn) => {
        listeners.current.add(fn);
        return () => listeners.current.delete(fn);
      },
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    // A child may have locked scrolling before Lenis existed (child effects run first).
    if (holds.current.size > 0) lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Each route starts at the top (or at its #hash), with fresh scroll triggers.
  useEffect(() => {
    const hash = window.location.hash;
    const frame = requestAnimationFrame(() => {
      lenisRef.current?.scrollTo(hash && document.querySelector(hash) ? hash : 0, { immediate: true, force: true });
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // One page view per route visit, counted by the CMS (Analytics). Fire-and-forget.
  useEffect(() => {
    const url = cmsBrowserUrl("/public/track");
    if (!url) return;
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  const [selectedService, setSelectedService] = useState<string | undefined>();

  const openForm = useCallback((service?: string | unknown) => {
    setSelectedService(typeof service === "string" ? service : undefined);
    setFormOpen(true);
  }, []);
  const closeForm = useCallback(() => {
    setFormOpen(false);
    setSelectedService(undefined);
  }, []);

  // The page behind the pop-up doesn't scroll while it is open.
  useEffect(() => {
    if (formOpen) scrollLock.lock("modal");
    else scrollLock.unlock("modal");
  }, [formOpen, scrollLock]);

  // Every full page load (first visit or refresh): open the pop-up once. In-site
  // navigation keeps this Shell mounted, so moving between pages doesn't reopen it.
  useEffect(() => {
    const t = window.setTimeout(() => setFormOpen(true), AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Closing on route change keeps a stale pop-up from following the visitor.
  useEffect(() => setFormOpen(false), [pathname]);

  const go = useCallback<Go>(
    (href) => {
      // Clicking a link is an explicit choice to move on: release the intro hold.
      scrollLock.unlock("intro");
      const scroll = (target: string) =>
        lenisRef.current?.scrollTo(target === "#top" ? 0 : target, { duration: 1.6 });
      if (href.startsWith("#")) return void scroll(href);
      const url = new URL(href, window.location.href);
      if (url.pathname === pathname) return void scroll(url.hash || "#top");
      router.push(href, { scroll: false });
    },
    [pathname, router, scrollLock]
  );

  return (
    <LockContext.Provider value={scrollLock}>
    <ServiceFormContext.Provider value={openForm}>
    <GoContext.Provider value={go}>
      <Cursor />
      <div className="lab-bg" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <Nav />
      {children}
      <Footer social={site.social} />
      <ServiceModal
        open={formOpen}
        onClose={closeForm}
        responseTime={site.general.responseTime}
        initialService={selectedService}
      />
    </GoContext.Provider>
    </ServiceFormContext.Provider>
    </LockContext.Provider>
  );
}
