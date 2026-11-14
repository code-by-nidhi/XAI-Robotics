"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useServiceForm } from "../Shell";
import { usePhotoReveal } from "./usePhotoReveal";
import RobotPhoto from "./RobotPhoto";

const FEATURES = [
  {
    art: <RobotPhoto name="humanoid" />,
    t: "Robotics Programme",
    d: "Six months of lab sessions on microcontrollers, sensors, control, ROS 2 and computer vision — all on real hardware.",
  },
  {
    art: <RobotPhoto name="arm" />,
    t: "R&D Incubation",
    d: "Bring your own idea. We issue components from our lab and mentor you from prototype to presentable research.",
  },
  {
    art: <RobotPhoto name="drone" />,
    t: "Workshops & Labs",
    d: "Bootcamps, live robot shows and complete lab setups for schools, colleges and franchise partners.",
  },
];

export default function HomeFeatures({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useReveal(root);
  usePhotoReveal(root);

  return (
    <section className="section hm" id="services" ref={root}>
      <div className="container">
        <div className="hm-head">
          <div>
            <span className="section-tag rv">What we do</span>
            <h2 className="h2 rv">Key services</h2>
          </div>
          <div className="hm-head-side rv">
            <p className="muted">
              Everything you need to go from curious beginner to engineer who can design, build and debug a working
              robot.
            </p>
            <button type="button" className="btn btn-ghost" onClick={openServiceForm}>
              <span className="btn-dot" /> Request a Service
            </button>
          </div>
        </div>

        <div className="hm-cards">
          {FEATURES.map((f) => (
            <article key={f.t} className="hm-card rv">
              <div className="hm-card-media">{f.art}</div>
              <h3>{f.t}</h3>
              <p className="muted">{f.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
