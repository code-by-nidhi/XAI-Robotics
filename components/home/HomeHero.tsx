"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useGsapTilt } from "@/lib/gsapEffects";
import { useServiceForm } from "../Shell";
import ChiChi from "../ChiChi";
import CrossBands from "./CrossBands";

/*
 * Re-encoded for scrubbing: a keyframe every 4 frames and no B-frames, so any
 * point in the video can be shown almost instantly (the original had a single
 * keyframe, which made every seek decode from the start).
 */
const VIDEO_SRC = "/videos/robot-assembly.mp4";
const VIDEO_POSTER = "/videos/robot-assembly-poster.jpg";

/** How far the visitor scrolls (as a share of the screen height) to play the 36 s video start to end. */
const SCRUB_DISTANCE = "+=450%";
/** How quickly the shown frame catches up with the scroll position each animation frame (0–1). */
const EASE = 0.14;

export default function HomeHero({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useGsapTilt(root, ".hh-card");

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

  /*
   * "Vision online": the video is driven by scrolling. When the frame reaches
   * the middle of the screen it pins there, and scrolling down plays it
   * forward (scrolling up plays it back). Once it reaches the end, the page
   * carries on.
   */
  useGSAP(
    () => {
      const video = videoRef.current;
      const stage = stageRef.current;
      if (!video || !stage) return;

      video.pause();
      let target = 0; // 0–1, from the scroll position
      let shown = 0; // 0–1, eased towards target
      let raf = 0;
      let blobUrl = "";

      // Ease the frame towards the scroll position and seek once the previous seek has landed.
      const tick = () => {
        raf = 0;
        const d = video.duration;
        if (!d) return;
        shown += (target - shown) * EASE;
        if (Math.abs(target - shown) < 0.0005) shown = target;
        const t = shown * Math.max(0, d - 0.05);
        if (!video.seeking && Math.abs(video.currentTime - t) > 1 / 60) video.currentTime = t;
        if (shown !== target || video.seeking) raf = requestAnimationFrame(tick);
      };
      const sync = (p: number) => {
        target = p;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const st = ScrollTrigger.create({
        trigger: stage,
        start: "center center",
        end: SCRUB_DISTANCE,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => sync(self.progress),
        onRefresh: (self) => sync(self.progress),
      });

      // iOS only paints seeked frames after the video has been played once.
      const onMeta = () => {
        video
          .play()
          .then(() => video.pause())
          .catch(() => {})
          .finally(() => sync(st.progress));
      };
      video.addEventListener("loadedmetadata", onMeta);

      // Load the whole file up front so seeks never wait on the network;
      // fall back to normal streaming if that fails.
      const ctrl = new AbortController();
      fetch(VIDEO_SRC, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.blob() : Promise.reject()))
        .then((blob) => {
          blobUrl = URL.createObjectURL(blob);
          video.src = blobUrl;
        })
        .catch(() => {
          if (!ctrl.signal.aborted) video.src = VIDEO_SRC;
        });

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
        scrollTrigger: { trigger: stage, start: "top 92%" },
      });

      return () => {
        ctrl.abort();
        if (raf) cancelAnimationFrame(raf);
        video.removeEventListener("loadedmetadata", onMeta);
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    },
    { scope: visionRef },
  );

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
              <span className="pulse" /> Established August 2025 · An initiative of techcadd
            </p>
            <h1 className="hh-title">
              <span className="hh-line">
                <span>X AI ROBOTICS</span>
              </span>
              <span className="hh-line">
                <span className="hh-dim" style={{ fontSize: "0.55em", letterSpacing: "0.01em", display: "block", marginTop: "4px" }}>
                  Engineering the Future
                </span>
              </span>
              <span className="hh-line">
                <span style={{ fontSize: "0.48em", letterSpacing: "0.01em", display: "block" }}>
                  Bringing Intelligence to Life
                </span>
              </span>
            </h1>
            <div className="hh-actions hh-fade">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const el = document.getElementById("services");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else onNavigate("/services");
                }}
              >
                Explore Our Robotics Services <span aria-hidden>→</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={openServiceForm}>
                <span className="btn-dot" /> Partner With X AI Robotics
              </button>
            </div>
          </div>

          <aside className="hh-card hh-fade">
            <div className="hh-quote-bubble">
              <p>
                &ldquo;We don&apos;t just introduce people to robots. We help them understand, build and explore the technology behind them.&rdquo;
              </p>
            </div>
            <p className="hh-card-tagline">
              FROM ROBOTICS EDUCATION TO REAL-WORLD INNOVATION
            </p>
            <a
              href="#beginning"
              className="hh-card-btn"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("beginning");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else onNavigate("/about-us");
              }}
            >
              <span className="btn-dot" /> OUR JOURNEY
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
              assembled and brought online at X AI Robotics.
            </p>
            <div className="hv-fade">
              <button type="button" className="btn btn-primary" onClick={openServiceForm}>
                Request a Service <span aria-hidden>→</span>
              </button>
            </div>
          </div>

          <div className="hv-stage" ref={stageRef}>
            <div className="hh-media hv-frame">
              <video
                ref={videoRef}
                className="hh-video"
                poster={VIDEO_POSTER}
                muted
                playsInline
                preload="auto"
                aria-label="A robot being assembled, shown in black and grey. Scroll to play."
              />
              <span className="hv-fadeout" aria-hidden="true" />
              <span className="hh-chip hh-chip-tl mono">X AI · Lab 01</span>
              <span className="hh-chip hh-chip-br mono" aria-hidden="true">
                Scroll to play ↓
              </span>
              <span className="hh-progress" aria-hidden="true">
                <i ref={progressRef} />
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
