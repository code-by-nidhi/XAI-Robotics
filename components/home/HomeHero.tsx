"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollLock, useServiceForm } from "../Shell";
import ChiChi from "../ChiChi";
import CrossBands from "./CrossBands";

const VIDEO_SRC = "https://cdn.droptocdn.com/files/98ca7f60-1ff5-4b78-a006-fbe50ec3b0f6/robot_assembly_black_gray.mp4";

/** Once per browser session the intro plays through with the page held on it. */
const SEEN_KEY = "xai-intro-video-seen";
/** If playback makes no progress for this long (slow network, stall), let the visitor go. */
const STALL_MS = 8000;

const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the intro may simply play again next visit */
  }
}

export default function HomeHero({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const [theatre, setTheatre] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollLock = useScrollLock();
  const openServiceForm = useServiceForm();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  // Intro text animation.
  useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hh-line > span", { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.1)
        .from(".hh-fade", { opacity: 0, y: 24, duration: 1.1, stagger: 0.08 }, 0.5)
        .from(".hh-bg-inner", { opacity: 0, scale: 1.08, duration: 2.4 }, 0);

      // Background drifts slower than the page as it scrolls away.
      gsap.to(".hh-bg-inner", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  // "Vision online" section: heading block, then the video card rising in.
  useGSAP(
    () => {
      gsap.from(".hv-fade", {
        opacity: 0,
        y: 30,
        duration: 1.1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: visionRef.current, start: "top 85%" },
      });
      gsap.from(".hv-frame", {
        opacity: 0,
        y: 60,
        scale: 0.97,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: ".hv-frame", start: "top 92%" },
      });
    },
    { scope: visionRef },
  );

  /*
   * Hold the page on the video until it has played through once.
   *
   * The lock is released when the video ends — or, so nobody is ever stuck,
   * when it can't autoplay, fails to load, stalls, the visitor presses
   * "Skip", clicks any navigation link, or prefers reduced motion.
   */
  useEffect(() => {
    const video = videoRef.current;
    const media = mediaRef.current;
    if (!video || !media) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || alreadySeen()) {
      video.loop = true;
      video.play().catch(() => {});
      return;
    }

    let released = false;
    let centred = false;
    let lastTime = -1;
    let lastProgressAt = performance.now();

    const release = () => {
      if (released) return;
      released = true;
      markSeen();
      setHolding(false);
      scrollLock.unlock("intro");
      // From now on it just loops quietly in the background.
      video.loop = true;
      if (video.paused) video.play().catch(() => {});
    };

    scrollLock.lock("intro");
    setHolding(true);
    // Released from outside (e.g. a nav link): stop holding too.
    const unsubscribe = scrollLock.subscribe(() => {
      if (!scrollLock.isLocked("intro")) release();
    });

    // Any attempt to scroll brings the whole video into view, then stays there.
    // Scrolling inside a dialog (e.g. the service form) is not an attempt to leave the intro.
    const inDialog = (e: Event) => (e.target as Element | null)?.closest?.("[role=dialog]") != null;
    const centre = () => {
      if (released || centred || scrollLock.isLocked("modal")) return;
      centred = true;
      const rect = media.getBoundingClientRect();
      const offset = -Math.max(0, (window.innerHeight - rect.height) / 2);
      scrollLock.scrollTo(media, { offset, duration: 1.1 });
    };
    const onWheel = (e: WheelEvent) => {
      if (!inDialog(e)) centre();
    };
    const onTouch = (e: TouchEvent) => {
      if (released || inDialog(e)) return;
      e.preventDefault();
      centre();
    };
    const onKey = (e: KeyboardEvent) => {
      if (released || !SCROLL_KEYS.has(e.key) || inDialog(e)) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName)) return;
      e.preventDefault();
      centre();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("keydown", onKey);

    const onTime = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        lastProgressAt = performance.now();
      }
    };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", release);
    video.addEventListener("error", release);

    // Autoplay blocked (e.g. data saver): don't hold the page on a still frame.
    video.play().catch(release);

    // Stall watchdog.
    const watchdog = window.setInterval(() => {
      if (!released && performance.now() - lastProgressAt > STALL_MS) release();
    }, 1000);

    return () => {
      window.clearInterval(watchdog);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", release);
      video.removeEventListener("error", release);
      unsubscribe();
      // Leaving the page mid-intro must never leave scrolling locked.
      if (!released) scrollLock.unlock("intro");
    };
  }, [scrollLock]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <>
      <section className="hh" id="top" ref={root}>
        {/* Chi Chi behind the headline, darkened and faded into the page (like a hero background photo). */}
        <div className="hh-bg" aria-hidden="true">
          <div className="hh-bg-inner">
            <ChiChi className="hh-bg-img" priority />
          </div>
          <span className="hh-bg-shade" />
        </div>

        {/* Template layout: headline + buttons bottom-left, a glass card bottom-right. */}
        <div className="container hh-grid">
          <div className="hh-copy">
            <p className="eyebrow hh-fade">
              <span className="pulse" /> Robotics · AI · Research &amp; Innovation
            </p>
            <h1 className="hh-title">
              <span className="hh-line">
                <span>The future of</span>
              </span>
              <span className="hh-line">
                <span>robotics is</span>
              </span>
              <span className="hh-line">
                <span className="hh-dim">built here</span>
              </span>
            </h1>
            <div className="hh-actions hh-fade">
              <button type="button" className="btn btn-primary" onClick={openServiceForm}>
                Request a Service <span aria-hidden>→</span>
              </button>
              <a href="/services" className="hh-link" onClick={(e) => go(e, "/services")}>
                Explore services <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          <aside className="hh-card hh-fade">
            <p className="mono muted hh-card-eyebrow">Est. August 2025</p>
            <h2 className="hh-card-title">Our journey began with Chi Chi</h2>
            <p className="muted hh-card-text">
              Where Artificial Intelligence meets the physical world — practical robotics education, intelligent
              automation and research-driven innovation, rooted in India.
            </p>
            <a href="/about#journey" className="btn btn-ghost hh-card-btn" onClick={(e) => go(e, "/about#journey")}>
              <span className="btn-dot" /> Our journey
            </a>
          </aside>
        </div>
      </section>

      {/* Crossing "A techcadd initiative" bands, right after the hero. */}
      <CrossBands />

      {/* Vision online — laid out like the template's "Where technology meets design". */}
      <section className="hv" id="vision" ref={visionRef}>
        <div className="container">
          <div className="hm-center hv-head">
            <span className="section-tag hv-fade">
              <span className="pulse" /> Vision online
            </span>
            <h2 className="h2 hv-fade">Where technology meets intelligence</h2>
            <p className="muted hv-fade">
              Embedded systems, mechatronics, computer vision and ROS 2 — watch an intelligent machine being designed,
              assembled and brought online at XAI Robotics.
            </p>
            <div className="hv-fade">
              <button type="button" className="btn btn-primary" onClick={openServiceForm}>
                Request a Service <span aria-hidden>→</span>
              </button>
            </div>
          </div>

          <div className={`hh-media hv-frame${holding ? " is-holding" : ""}`} ref={mediaRef}>
            <video
              ref={videoRef}
              className="hh-video"
              src={VIDEO_SRC}
              muted
              playsInline
              autoPlay
              preload="auto"
              aria-label="A robot being assembled, shown in black and grey"
            />
            <span className="hv-fadeout" aria-hidden="true" />
            <span className="hh-chip hh-chip-tl mono">XAI · Lab 01</span>
            <button
              type="button"
              className="hv-play"
              onClick={() => setTheatre(true)}
              aria-label="Play the video with sound"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </button>
            {holding && (
              <button
                type="button"
                className="hh-chip hh-chip-br hh-skip mono"
                onClick={() => scrollLock.unlock("intro")}
              >
                Skip intro ›
              </button>
            )}
            {holding && (
              <span className="hh-progress" aria-hidden="true">
                <i style={{ transform: `scaleX(${progress})` }} />
              </span>
            )}
          </div>
        </div>
      </section>

      {theatre && <VideoTheatre src={VIDEO_SRC} onClose={() => setTheatre(false)} />}
    </>
  );
}

/** Full-screen player with sound and controls (the template's lightbox). */
function VideoTheatre({ src, onClose }: { src: string; onClose: () => void }) {
  const scrollLock = useScrollLock();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    scrollLock.lock("theatre");
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      scrollLock.unlock("theatre");
      previous?.focus?.();
    };
  }, [onClose, scrollLock]);

  return (
    <div
      className="hv-theatre"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      data-lenis-prevent
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        type="button"
        className="sm-close hv-theatre-close"
        aria-label="Close video"
        onClick={onClose}
        ref={closeRef}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <video className="hv-theatre-video" src={src} controls autoPlay playsInline />
    </div>
  );
}
