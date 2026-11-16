"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useServiceForm } from "../Shell";
import { usePhotoReveal } from "./usePhotoReveal";
import RobotPhoto from "./RobotPhoto";

const STATS = [
  ["Duration", "6", "months"],
  ["Builds", "12", "projects"],
];

export default function HomeCaseStudy({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useReveal(root);
  usePhotoReveal(root);

  return (
    <section className="section hm" id="case-studies" ref={root}>
      <div className="container hm-split">
        <div className="hm-split-copy">
          <span className="section-tag rv">Case study</span>
          <h2 className="h2 rv">Introducing the X AI Robotics Programme</h2>
          <p className="muted rv">
            Three structured phases — 12 foundational technical modules, 12 practical robotics builds and optional R&amp;D incubation — taking learners from core principles to real-world intelligent machines.
          </p>
          <dl className="hm-stats rv">
            {STATS.map(([label, n, unit]) => (
              <div key={label}>
                <dt className="mono muted">{label}</dt>
                <dd>
                  {n}
                  <small>{unit}</small>
                </dd>
              </div>
            ))}
          </dl>
          <div className="rv">
            <button type="button" className="btn btn-primary" onClick={openServiceForm}>
              Request a Service <span aria-hidden>→</span>
            </button>
          </div>
        </div>

        <div className="hm-media rv" aria-hidden="true">
          <RobotPhoto name="chichi" />
          <span className="hm-media-tag mono">Phase 01 → 03</span>
        </div>
      </div>
    </section>
  );
}
