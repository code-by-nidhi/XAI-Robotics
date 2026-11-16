"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";

const PILLARS = [
  {
    num: "01",
    title: "A Foundation Built on Practical Robotics",
    desc: "Our approach emphasises hands-on understanding of robotics rather than limiting the experience to presentations and theoretical explanations.",
  },
  {
    num: "02",
    title: "Experience with Modern Robotic Platforms",
    desc: "Chi Chi, our AI robot dog prototype, provides an engaging introduction to the capabilities and possibilities of contemporary quadruped robotic systems.",
  },
  {
    num: "03",
    title: "Multi-Disciplinary Technology Exposure",
    desc: "Our technical learning environment connects mechanical design, electronics, embedded systems, programming, computer vision, AI and robotics software.",
  },
  {
    num: "04",
    title: "Institutional Collaboration",
    desc: "We work towards making robotics accessible to schools, colleges, universities and educational partners through workshops, laboratory solutions and structured programmes.",
  },
  {
    num: "05",
    title: "Project-Based Engineering",
    desc: "Our flagship programme provides opportunities to build practical robotic systems and explore different engineering challenges.",
  },
  {
    num: "06",
    title: "Research-Oriented Development",
    desc: "Our R&D initiative encourages original ideas, prototype development and engineering experimentation.",
  },
  {
    num: "07",
    title: "Connected to the techcadd Ecosystem",
    desc: "X AI Robotics benefits from an educational and technology-oriented ecosystem that supports its wider approach to skill development and institutional engagement.",
  },
  {
    num: "08",
    title: "A Future-Focused Outlook",
    desc: "We aim to remain connected to the evolution of robotics and intelligent automation while promoting responsible, practical and application-oriented innovation.",
  },
];

export default function HomeWhyChoose() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".sec-card");

  return (
    <section className="section hm" id="why-choose-us" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Why Choose Us</span>
          <h2 className="h2 rv">Why X AI Robotics?</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
            More Than Robotics Awareness. A Complete Engineering Experience.
          </p>
        </div>

        <div className="sec-grid-4 rv" style={{ marginTop: "48px" }}>
          {PILLARS.map((p) => (
            <article key={p.num} className="sec-card">
              <span className="sec-card-num">{p.num}</span>
              <h3 className="sec-card-title" style={{ fontSize: "1rem" }}>
                {p.title}
              </h3>
              <p className="sec-card-text" style={{ fontSize: "13.5px" }}>
                {p.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
