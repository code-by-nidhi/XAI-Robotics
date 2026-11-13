"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/reveal";

/** Cut-out photos (backgrounds removed); WebP is lossless, PNG is the fallback. */
const ROBOTS = [
  { key: "arm", name: "robot-arm", w: 576, h: 659, alt: "Robotic arm", cls: "hm-bot-arm" },
  { key: "humanoid", name: "robot-humanoid", w: 620, h: 685, alt: "Humanoid robot", cls: "hm-bot-humanoid" },
  { key: "drone", name: "robot-drone", w: 594, h: 302, alt: "Quadcopter drone", cls: "hm-bot-drone" },
];

export default function HomeAbout({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // Each robot rises in on its own; the drone keeps a gentle hover.
  useGSAP(
    () => {
      gsap.from(".hm-bot", {
        y: 60,
        opacity: 0,
        duration: 1.4,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".hm-wide", start: "top 80%" },
      });
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(".hm-bot-drone img", { y: -14, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
    },
    { scope: root }
  );

  return (
    <section className="section hm" id="about" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">About XAI Robotics</span>
          <h2 className="h2 rv">Engineering intelligence. Inspiring innovation.</h2>
          <p className="muted rv">
            XAI Robotics brings together Artificial Intelligence, Embedded Systems, Mechatronics, Computer Vision, ROS
            2, CAD Design and Intelligent Control to encourage the development of real-world robotic applications —
            making next-generation robotics more accessible across India.
          </p>
          <div className="rv">
            <a
              href="/about"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/about");
              }}
            >
              Our story <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="hm-wide hm-bots rv">
          {ROBOTS.map((r) => (
            <figure key={r.key} className={`hm-bot ${r.cls}`}>
              <picture>
                <source type="image/webp" srcSet={`/images/${r.name}.webp`} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/${r.name}.png`} width={r.w} height={r.h} alt={r.alt} loading="lazy" draggable={false} />
              </picture>
            </figure>
          ))}
          <span className="hm-media-tag mono">
            <span className="pulse" /> XAI Lab · Live build
          </span>
        </div>
      </div>
    </section>
  );
}
