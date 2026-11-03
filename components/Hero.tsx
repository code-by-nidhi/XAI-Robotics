"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import RobotEye from "./RobotEye";
import Telemetry from "./Telemetry";

const TELEMETRY_L = [
  { k: "SERVO TORQUE", base: 42.6, jitter: 0.6, unit: "Nm", digits: 1 },
  { k: "CORE TEMP", base: 36.2, jitter: 0.15, unit: "°C", digits: 1 },
  { k: "LATENCY", base: 3.8, jitter: 0.4, unit: "ms", digits: 2 },
];
const TELEMETRY_R = [
  { k: "DEPTH FIELD", base: 12.4, jitter: 0.08, unit: "m", digits: 2 },
  { k: "OBJECTS", base: 128, jitter: 3, unit: "trk", digits: 0 },
  { k: "CONFIDENCE", base: 99.2, jitter: 0.3, unit: "%", digits: 1 },
];

export default function Hero({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);

  // Ambient motion: rotating lens rings + cursor-tracking iris.
  useGSAP(
    () => {
      gsap.to(".eye-r1", { rotation: 360, svgOrigin: "0 0", duration: 60, repeat: -1, ease: "none" });
      gsap.to(".eye-ticks", { rotation: -360, svgOrigin: "0 0", duration: 120, repeat: -1, ease: "none" });
      gsap.to(".eye-r2", { rotation: -360, svgOrigin: "0 0", duration: 28, repeat: -1, ease: "none" });
      gsap.to(".eye-r3", { rotation: 360, svgOrigin: "0 0", duration: 16, repeat: -1, ease: "none" });
      gsap.to(".eye-aperture", { rotation: 360, svgOrigin: "0 0", duration: 9, repeat: -1, ease: "none" });
      gsap.to(".eye-core", { scale: 1.6, svgOrigin: "0 0", duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" });

      const ix = gsap.quickTo(".eye-iris", "x", { duration: 0.8, ease: "power3" });
      const iy = gsap.quickTo(".eye-iris", "y", { duration: 0.8, ease: "power3" });
      const tx = gsap.quickTo(".eye-tilt", "rotationY", { duration: 1.2, ease: "power3" });
      const ty = gsap.quickTo(".eye-tilt", "rotationX", { duration: 1.2, ease: "power3" });
      const px = gsap.quickTo(".hero-parallax", "x", { duration: 1.4, ease: "power3" });
      const py = gsap.quickTo(".hero-parallax", "y", { duration: 1.4, ease: "power3" });

      const move = (e: MouseEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        ix(nx * 46);
        iy(ny * 46);
        tx(nx * 18);
        ty(-ny * 18);
        px(nx * -24);
        py(ny * -16);
      };
      window.addEventListener("mousemove", move);
      return () => window.removeEventListener("mousemove", move);
    },
    { scope: root }
  );

  // Intro reveal + scroll-out.
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".eye-intro", { scale: 0.4, opacity: 0, rotation: -90, duration: 2.2 }, 0)
        .from(".hero-char", { yPercent: 115, duration: 1.5, stagger: 0.09 }, 0.15)
        .from(".hero-flare", { scaleX: 0, opacity: 0, duration: 1.4, stagger: 0.1 }, 0.5)
        .from(".hero-sub span", { opacity: 0, y: 10, duration: 0.8, stagger: 0.05 }, 0.6)
        .from(".hero-fade", { opacity: 0, y: 24, duration: 1.2, stagger: 0.08 }, 0.9)
        .from(".hero-floor", { opacity: 0, duration: 2 }, 0.4);

      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-content", { yPercent: -35, opacity: 0, ease: "none", scrollTrigger: st });
      gsap.to(".eye-scroll", { scale: 1.8, opacity: 0, ease: "none", scrollTrigger: st });
      gsap.to(".hero-floor", { yPercent: 30, opacity: 0.2, ease: "none", scrollTrigger: st });
    },
    { scope: root }
  );

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-floor" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="eye-scroll">
        <div className="eye-intro">
          <div className="eye-tilt">
            <RobotEye />
          </div>
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-parallax">
          <p className="eyebrow hero-fade">
            <span className="pulse" /> Autonomous Systems Lab<span className="hide-sm"> — Est. 2021</span>
          </p>
          <h1 className="hero-title" aria-label="XAI Robotics">
            {"XAI".split("").map((c, i) => (
              <span key={i} className="hero-mask">
                <span className="hero-char chrome chrome-shine">{c}</span>
              </span>
            ))}
          </h1>
          <div className="hero-subrow" aria-hidden="true">
            <span className="hero-flare" />
            <p className="hero-sub">
              {"ROBOTICS".split("").map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </p>
            <span className="hero-flare" />
          </div>
          <p className="hero-lede hero-fade">
            Embodied intelligence for the physical world. We build machines that perceive, reason and move — with
            precision you can measure and safety you can trust.
          </p>
          <div className="hero-actions hero-fade">
            <a
              href="#fleet"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("#fleet");
              }}
            >
              Explore the fleet <span aria-hidden>→</span>
            </a>
            <a
              href="#anatomy"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("#anatomy");
              }}
            >
              <span className="btn-dot" /> See it move
            </a>
          </div>
        </div>
      </div>

      <div className="hero-hud hero-hud-l hero-fade">
        <span className="hud-tag">// TELEMETRY.L</span>
        <Telemetry rows={TELEMETRY_L} />
      </div>
      <div className="hero-hud hero-hud-r hero-fade">
        <span className="hud-tag">// VISION.R</span>
        <Telemetry rows={TELEMETRY_R} />
      </div>

      <div className="hero-scroll hero-fade" aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}
