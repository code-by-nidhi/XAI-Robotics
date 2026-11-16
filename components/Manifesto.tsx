"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const TEXT =
  "We engineer machines that perceive the world, reason about it, and move through it with intent — robots built to work beside people, not instead of them.";
const HIGHLIGHT = new Set(["perceive", "reason", "move", "beside"]);

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".mf-word",
        { opacity: 0.1, filter: "blur(4px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: ".mf-text", start: "top 80%", end: "bottom 50%", scrub: true },
        }
      );
      gsap.from(".mf-meta > *", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    },
    { scope: root }
  );

  return (
    <section className="section manifesto" ref={root}>
      <div className="container">
        <div className="mf-meta">
          <span className="section-tag">Manifesto</span>
          <span className="mono muted">MISSION.TXT — 2026</span>
        </div>
        <p className="mf-text">
          {TEXT.split(" ").map((w, i) => {
            const clean = w.replace(/[^a-z]/gi, "").toLowerCase();
            return (
              <span key={i} className={`mf-word ${HIGHLIGHT.has(clean) ? "accent" : ""}`}>
                {w}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
