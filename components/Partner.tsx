"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const WHY = [
  ["Industrial hardware", "Work with professional-grade microcontrollers, sensors and drivers used in real products, not toy kits."],
  ["A robot you keep", "Your Phase 2 build goes home with you as proof of what you can engineer."],
  ["Hardware-backed R&D", "We supply the components for approved student research ideas in Month 6."],
  ["Mentored by engineers", "Learn directly from experienced mechatronics developers who build robots themselves."],
];

const OFFER = [
  "Turnkey robotics labs: equipment, layout and setup",
  "Train-the-trainer certification for your faculty",
  "The full 6-month curriculum and 12-project kit catalogue",
  "Marketing, admissions and ongoing technical support",
];

const GLANCE = [
  ["Programme length", "6 months · 3 phases"],
  ["Project catalogue", "12 builds"],
  ["Core toolchain", "ROS 2 · SolidWorks · OpenCV"],
  ["Ideal for", "Schools · Colleges · Institutes"],
  ["Backed by", "techcadd ecosystem"],
];

export default function Partner({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="franchise" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">Why XAI Robotics</span>
          <h2 className="h2 rv">
            Real engineering, from the first class <span className="accent">to the final prototype.</span>
          </h2>
        </div>
        <div className="pt-why">
          {WHY.map(([t, d]) => (
            <div key={t} className="rv">
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>

        <div className="panel pt-fr rv">
          <div>
            <span className="mono pt-kicker">Franchise &amp; B2B</span>
            <h3 className="pt-title">Bring XAI Robotics to your institution.</h3>
            <p className="muted">
              Schools, colleges and training centres can launch a complete robotics programme with our curriculum,
              hardware and trainer support, backed by the techcadd education ecosystem.
            </p>
            <ul className="diamond-list">
              {OFFER.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <a
              href="#contact"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("#contact");
              }}
            >
              Partner with us <span aria-hidden>→</span>
            </a>
          </div>
          <dl className="pt-glance" aria-label="Partner package at a glance">
            {GLANCE.map(([k, v]) => (
              <div key={k}>
                <dt className="muted">{k}</dt>
                <dd className="mono">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
