"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const REASONS = [
  {
    t: "Four skills in one",
    d: "Wire a circuit, program a microcontroller, tune a control loop and deploy an AI model. Few engineers can do all four.",
    icon: <path d="M5 5h14v14H5zM9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />,
  },
  {
    t: "Proof, not paper",
    d: "A robot you designed and built says more in an interview than any certificate.",
    icon: <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />,
  },
  {
    t: "Many career paths",
    d: "Embedded systems, IoT, automation, mechatronics, drones, EVs and AI hardware all start here.",
    icon: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  },
  {
    t: "Start early",
    d: "Students from Class 9 can begin. Phase 1 starts from the fundamentals, so curiosity is enough.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
];

export default function WhyNow() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="why" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">[06] Why Robotics, Why Now</span>
          <h2 className="h2 rv">
            Where AI leaves the screen and <span className="accent">enters the real world.</span>
          </h2>
          <p className="muted rv">
            Robotics brings together electronics, programming, mechanics, control systems and artificial intelligence.
            It is the skill set behind automation, smart manufacturing, drones, IoT devices, electric vehicles and
            intelligent machines.
          </p>
        </div>
        <div className="wn-grid">
          {REASONS.map((r) => (
            <article key={r.t} className="panel rv">
              <div className="wn-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24">{r.icon}</svg>
              </div>
              <h3>{r.t}</h3>
              <p className="muted">{r.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
