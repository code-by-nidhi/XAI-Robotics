"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const PROVIDE = [
  ["Components", "Advanced sensors, boards and actuators from our lab"],
  ["Mentorship", "Design reviews with mechatronics engineers"],
  ["Lab access", "Tools and test benches for building and testing"],
  ["IP support", "Guidance on documenting and protecting your innovation"],
];

const STEPS = [
  ["Propose", "Submit a one-page concept: the problem, your approach and the hardware you need."],
  ["Review", "Our engineers assess feasibility and help you refine the scope."],
  ["Build", "Prototype with lab-issued components and weekly mentor check-ins."],
  ["Showcase", "Demonstrate your prototype and receive guidance on next steps, from competitions to patents."],
];

const IDEAS = [
  "Swarm coordination",
  "Edge-AI perception",
  "Assistive robotics",
  "Agri-tech automation",
  "Industrial inspection",
  "Smart mobility",
];

export default function RnDLab() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled rd" id="rd" ref={root}>
      <div className="container rd-grid">
        <div>
          <span className="section-tag rv">Phase 03 · R&amp;D Lab</span>
          <h2 className="h2 rv">
            Your idea. <span className="accent-amber">Our hardware.</span>
          </h2>
          <p className="muted rd-lead rv">
            In Month 6, students who want to go further can propose an original concept. If it&apos;s approved, XAI
            Robotics supplies the advanced components and engineering guidance to turn it into a working prototype.
          </p>
          <div className="rd-provide">
            {PROVIDE.map(([t, d]) => (
              <div key={t} className="panel rv">
                <b>{t}</b>
                <span className="muted">{d}</span>
              </div>
            ))}
          </div>
          <span className="mono muted rd-ideas-label rv">Example research directions</span>
          <ul className="chips rv">
            {IDEAS.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <ol className="rd-steps">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rv">
              <span className="rd-n mono">0{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
