"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const STEPS = [
  { t: "Perceive", d: "LiDAR, stereo depth and tactile skin fuse into a live 3D model of the world, refreshed 200× a second." },
  { t: "Reason", d: "On-device foundation models break goals into plans, predicting physics before a single motor turns." },
  { t: "Act", d: "Torque-controlled actuators execute with millisecond feedback, adapting mid-motion to the unexpected." },
  { t: "Learn", d: "Every deployment feeds the fleet. New skills are validated in simulation and synced overnight." },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 900px)", mobile: "(max-width: 899px)" }, (ctx) => {
        const prop = ctx.conditions?.desktop ? "scaleX" : "scaleY";
        gsap.fromTo(
          ".pr-line-fill",
          { scaleX: prop === "scaleX" ? 0 : 1, scaleY: prop === "scaleY" ? 0 : 1 },
          {
            [prop]: 1,
            ease: "none",
            scrollTrigger: { trigger: ".pr-steps", start: "top 75%", end: "bottom 55%", scrub: true },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".pr-step").forEach((step) => {
        gsap.from(step, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 85%" },
        });
        ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          onEnter: () => step.classList.add("is-on"),
          onLeaveBack: () => step.classList.remove("is-on"),
        });
      });
      gsap.from(".pr-head > *", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="section process" id="process" ref={root}>
      <div className="container">
        <div className="pr-head">
          <span className="section-tag">[05] The Loop</span>
          <h2 className="h2">
            Sense. Think. <span className="accent">Move.</span> Repeat.
          </h2>
        </div>
        <div className="pr-steps">
          <div className="pr-line" aria-hidden="true">
            <span className="pr-line-fill" />
          </div>
          {STEPS.map((s, i) => (
            <article key={s.t} className="pr-step">
              <div className="pr-node" aria-hidden="true">
                <span />
              </div>
              <span className="mono muted">STAGE 0{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
