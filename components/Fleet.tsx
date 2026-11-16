"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Drone, Humanoid, Manipulator, Quadruped } from "./RobotArt";

type Unit = {
  code: string;
  kind: string;
  Art: () => React.JSX.Element;
  /** Path to a hardware render/photo in /public (e.g. "/renders/nova-h1.png"). Falls back to the line art. */
  render?: string;
  copy: string;
  specs: [string, string][];
};

const UNITS: Unit[] = [
  {
    code: "NOVA H1",
    kind: "General-purpose humanoid",
    Art: Humanoid,
    copy: "A 1.7 m bipedal platform that learns new tasks from a handful of demonstrations.",
    specs: [
      ["Degrees of freedom", "44"],
      ["Payload", "25 kg"],
      ["Runtime", "8 h"],
    ],
  },
  {
    code: "KINETA A7",
    kind: "Precision manipulator",
    Art: Manipulator,
    copy: "Seven-axis collaborative arm for assembly lines where tolerance is measured in microns.",
    specs: [
      ["Repeatability", "±0.02 mm"],
      ["Reach", "1.3 m"],
      ["Payload", "14 kg"],
    ],
  },
  {
    code: "VANTA Q4",
    kind: "All-terrain quadruped",
    Art: Quadruped,
    copy: "Climbs stairs, crosses rubble, and inspects sites that are too dangerous for people.",
    specs: [
      ["Top speed", "3.4 m/s"],
      ["IP rating", "IP67"],
      ["Sensors", "360° LiDAR"],
    ],
  },
  {
    code: "SKYE D2",
    kind: "Autonomous aerial unit",
    Art: Drone,
    copy: "Swarm-capable drone with onboard vision for mapping, logistics, and search & rescue.",
    specs: [
      ["Flight time", "52 min"],
      ["Range", "18 km"],
      ["Swarm size", "64 units"],
    ],
  },
];

export default function Fleet() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>(".fl-panel");
      const mm = gsap.matchMedia();

      const reveal = (panel: HTMLElement, trigger: ScrollTrigger.Vars) => {
        const tl = gsap.timeline({ scrollTrigger: trigger });
        tl.to(panel.querySelectorAll(".draw"), {
          strokeDashoffset: 0,
          duration: 1.6,
          stagger: 0.06,
          ease: "power2.inOut",
        }).from(
          panel.querySelectorAll(".fl-reveal"),
          { y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" },
          0.2
        );
      };

      mm.add("(min-width: 900px)", () => {
        const track = root.current!.querySelector<HTMLElement>(".fl-track")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const scroll = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(".fl-bar-fill", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        panels.forEach((p) =>
          reveal(p, { trigger: p, containerAnimation: scroll, start: "left 70%", toggleActions: "play none none reverse" })
        );
        gsap.utils.toArray<HTMLElement>(".fl-bignum").forEach((n) =>
          gsap.fromTo(
            n,
            { xPercent: 30 },
            {
              xPercent: -30,
              ease: "none",
              scrollTrigger: { trigger: n, containerAnimation: scroll, start: "left right", end: "right left", scrub: true },
            }
          )
        );
      });

      mm.add("(max-width: 899px)", () => {
        panels.forEach((p) => reveal(p, { trigger: p, start: "top 70%" }));
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="fleet" id="fleet" ref={root}>
      <div className="fl-track">
        <div className="fl-intro">
          <span className="section-tag">The Fleet</span>
          <h2 className="h2">
            Four bodies.
            <br />
            <span className="accent">One mind.</span>
          </h2>
          <p className="muted">
            Every XAI platform runs the same neural core — a skill learned by one machine is available to the whole
            fleet by morning.
          </p>
          <div className="fl-bar" aria-hidden="true">
            <span className="fl-bar-fill" />
          </div>
          <span className="mono muted fl-hint">SCROLL TO TRAVERSE →</span>
        </div>

        {UNITS.map(({ code, kind, Art, render, copy, specs }, i) => (
          <article key={code} className="fl-panel">
            <span className="fl-bignum" aria-hidden="true">
              0{i + 1}
            </span>
            <div className="fl-art">
              <div className="fl-art-ring" aria-hidden="true" />
              {render ? <img className="fl-render" src={render} alt={`${code} — ${kind}`} loading="lazy" /> : <Art />}
            </div>
            <div className="fl-info">
              <span className="mono muted fl-reveal">
                UNIT 0{i + 1} / 0{UNITS.length} — {kind.toUpperCase()}
              </span>
              <h3 className="fl-name chrome fl-reveal">{code}</h3>
              <p className="fl-reveal">{copy}</p>
              <dl className="fl-specs">
                {specs.map(([k, v]) => (
                  <div key={k} className="fl-reveal">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
