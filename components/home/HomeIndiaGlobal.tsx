"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

interface CapabilityItem {
  num: string;
  title: string;
  desc: string;
  tag: string;
}

const CAPABILITIES: CapabilityItem[] = [
  {
    num: "01",
    title: "Robotics research and engineering",
    desc: "Advancing mechanical structures, kinematic modeling, dynamic control algorithms, and indigenous applied robotics research.",
    tag: "Core Engineering",
  },
  {
    num: "02",
    title: "Indigenous product development",
    desc: "Designing and prototyping sovereign hardware platforms, specialized rovers, and systems tailored for Indian operating conditions.",
    tag: "Hardware Prototyping",
  },
  {
    num: "03",
    title: "Embedded systems and control technologies",
    desc: "Developing high-frequency real-time controllers, deterministic motor buses, power management, and sensor fusion electronics.",
    tag: "Embedded Firmware",
  },
  {
    num: "04",
    title: "Industrial automation",
    desc: "Implementing articulated robotic arms, precision pick-and-place, automated optical inspection, and smart factory floor operations.",
    tag: "Applied Automation",
  },
  {
    num: "05",
    title: "AI-enabled robotic applications",
    desc: "Integrating edge computer vision, real-time SLAM navigation, neural perception, and adaptive machine learning models.",
    tag: "Embodied AI",
  },
  {
    num: "06",
    title: "Robotics manufacturing and component development",
    desc: "Fostering local manufacturing ecosystems for high-torque actuators, gear assemblies, precision chassis, and sensory suites.",
    tag: "Indigenous Supply",
  },
  {
    num: "07",
    title: "Technical education and workforce readiness",
    desc: "Upskilling the next generation of engineers through hands-on campus labs, practical workshops, and ROS 2 mastery.",
    tag: "Workforce Enablement",
  },
  {
    num: "08",
    title: "Collaboration between academia and industry",
    desc: "Connecting university engineering talent with real enterprise challenges, research grants, and commercial deployment pipelines.",
    tag: "Ecosystem Growth",
  },
];

export default function HomeIndiaGlobal() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section hm" id="india-global" ref={root}>
      <div className="container">
        <div className="in-split">
          {/* Left Column: Fixed / Sticky Story & Perspective */}
          <div className="in-left-col">
            <span className="section-tag rv">Global &amp; National Perspective</span>
            <h2 className="h2 rv">India&apos;s Robotics Future</h2>
            <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em", marginBottom: "16px" }}>
              A Global Technological Perspective
            </p>

            <div className="muted rv in-narrative" style={{ fontSize: "15px", lineHeight: "1.75" }}>
              <p style={{ marginBottom: "14px" }}>
                Robotics is becoming an increasingly important part of the global technology landscape. From intelligent manufacturing and logistics to healthcare, agriculture, research and autonomous systems, robotic technologies are creating new possibilities across industries.
              </p>
              <p style={{ marginBottom: "14px" }}>
                India has an opportunity to become an important participant in this global transformation through innovation, engineering talent, research, entrepreneurship and domestic technology development.
              </p>
              <p style={{ marginBottom: "14px" }}>
                X AI Robotics aims to align its work with this broader direction by encouraging practical robotics skills, institutional partnerships, research-oriented projects and responsible technology adoption.
              </p>
              <p>
                Our approach recognises the importance of global technological developments while remaining attentive to India&apos;s unique industrial, educational and societal requirements.
              </p>
            </div>

            <div className="sec-quote-box rv" style={{ marginTop: "24px" }}>
              Our ambition is to contribute to this evolving ecosystem through practical engagement, service-oriented initiatives and innovation-driven activities.
            </div>
          </div>

          {/* Right Column: Sticky Capabilities Cards Section */}
          <div className="in-right-col">
            <div className="in-right-header rv">
              <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                National Priorities · 8 Capability Pillars
              </span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text)", marginTop: "6px" }}>
                We believe India must continue to strengthen its capabilities in:
              </h3>
            </div>

            {/* Cascading Sticky Stack */}
            <div className="in-sticky-track">
              {CAPABILITIES.map((cap, idx) => (
                <article
                  key={cap.num}
                  className="in-sticky-card rv"
                  style={{ "--card-i": idx } as React.CSSProperties}
                >
                  <div className="in-card-head">
                    <span className="in-card-num-chip">
                      <span className="pulse" />
                      {cap.num}
                    </span>
                    <span className="in-card-tag">{cap.tag}</span>
                  </div>
                  <h4 className="in-card-title">{cap.title}</h4>
                  <p className="in-card-desc">{cap.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
