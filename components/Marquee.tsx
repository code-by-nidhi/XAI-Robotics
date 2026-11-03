"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const ROWS = [
  ["Computer Vision", "Motion Planning", "Sensor Fusion", "Force Control", "SLAM"],
  ["Humanoids", "Manipulators", "Quadrupeds", "Aerial Systems", "Swarm Autonomy"],
];

export default function Marquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tracks = gsap.utils.toArray<HTMLElement>(".mq-track");
      const loops = tracks.map((t, i) =>
        gsap.fromTo(
          t,
          { xPercent: i % 2 ? -50 : 0 },
          { xPercent: i % 2 ? 0 : -50, duration: 38, ease: "none", repeat: -1 }
        )
      );

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 250, 8);
          loops.forEach((l) =>
            gsap.fromTo(l, { timeScale: 1 + boost }, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: true })
          );
        },
      });

      gsap.to(".mq-row", {
        skewX: -6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section className="marquee" ref={root} aria-label="Capabilities">
      {ROWS.map((row, r) => (
        <div key={r} className={`mq-row ${r % 2 ? "mq-outline" : ""}`}>
          <div className="mq-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="mq-group" aria-hidden={dup === 1}>
                {row.map((w) => (
                  <span key={w} className="mq-item">
                    {w}
                    <svg viewBox="0 0 24 24" className="mq-star" aria-hidden="true">
                      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
                    </svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
