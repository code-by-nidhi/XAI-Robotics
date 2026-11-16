"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";

interface SectorItem {
  num: string;
  title: string;
  desc: string;
  tags: string[];
  icon: React.ReactNode;
}

const SECTORS: SectorItem[] = [
  {
    num: "01",
    title: "Manufacturing & Industrial Automation",
    desc: "Articulated robotic arms, precision handling, programmable logic controllers, and high-speed optical inspection systems optimizing factory floor productivity.",
    tags: ["Assembly Lines", "CNC Tending", "Quality Inspection"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M17 18h1" />
        <path d="M12 18h1" />
        <path d="M7 18h1" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Agriculture & Precision Agri-Tech",
    desc: "Autonomous ground rovers, multispectral crop health monitors, smart spraying actuators, and terrain-adaptive harvesters for sustainable precision farming.",
    tags: ["Field Monitoring", "Crop Analytics", "Autonomous Rovers"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-1 4.5-2 6.5-3.1 11.2A7 7 0 0 1 11 20Z" />
        <path d="m2 21 9-9" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Healthcare & Assistive Technologies",
    desc: "Robotics research contributing to motorized assistive devices, rehabilitation exoskeletons, hospital service rovers, and clinical laboratory automation.",
    tags: ["Assistive Mobility", "Clinical Automation", "Lab Telemetry"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Education & Institutional Research",
    desc: "Turnkey academic robotics laboratories, modular learning kits, ROS 2 quadruped platforms, and faculty orientation for schools, colleges, and universities.",
    tags: ["Turnkey Labs", "ROS 2 Curricula", "Faculty Enablement"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Logistics & Smart Warehousing",
    desc: "Autonomous Mobile Robots (AMRs), automated guided vehicles (AGVs), dynamic path-planning fleet coordination, and intelligent material sortation systems.",
    tags: ["Fleet AMRs", "Pallet Transport", "Sortation Routing"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "Smart Infrastructure & Urban Mobility",
    desc: "Embedded structural sensor nodes, bridge and tunnel inspection rovers, automated civil surveillance, and intelligent municipal traffic telemetry.",
    tags: ["Structural Audits", "Tunnel Inspection", "Smart Sensor Nodes"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-3" />
        <path d="M9 9v.01" />
        <path d="M9 12v.01" />
        <path d="M9 15v.01" />
        <path d="M9 18v.01" />
      </svg>
    ),
  },
  {
    num: "07",
    title: "Defence, Aerospace & Security Operations",
    desc: "Unmanned reconnaissance rovers, remote hazardous environment exploration, perimeter surveillance, and robust remote-operated tactical platforms.",
    tags: ["Perimeter Security", "Hazard Scouting", "Remote Operations"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    num: "08",
    title: "Energy, Utilities & Remote Inspection",
    desc: "Automated solar panel cleaning rovers, wind turbine blade inspection crawlers, high-voltage transmission monitoring, and pipeline non-destructive testing.",
    tags: ["Solar Maintenance", "Pipeline Audits", "Grid Monitoring"],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

export default function HomeIndustries() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".ind-card");

  return (
    <section className="section hm" id="industries" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Industries &amp; Applications</span>
          <h2 className="h2 rv">Robotics Across Modern Sectors</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
            Intelligent Machines · Real-World Impact · Symmetrical Architecture
          </p>
          <p className="muted rv" style={{ maxWidth: 820, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
            Robotics is reshaping productivity, precision, and safety across key global sectors. X AI Robotics designs, deploys, and consults across 8 synchronized industry verticals.
          </p>
        </div>

        {/* 8-Card Symmetrical Grid (4x2 on Desktop, 2x4 on Tablet, 1x8 on Mobile) */}
        <div className="ind-grid rv">
          {SECTORS.map((s) => (
            <article key={s.num} className="ind-card">
              <div className="ind-card-top">
                <span className="ind-card-num">{s.num}</span>
                <div className="ind-card-icon">{s.icon}</div>
              </div>
              <h3 className="ind-card-title">{s.title}</h3>
              <p className="ind-card-desc">{s.desc}</p>
              <div className="ind-card-tags">
                {s.tags.map((t) => (
                  <span key={t} className="ind-card-tag">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="sec-quote-box rv" style={{ maxWidth: 900, margin: "44px auto 0", textAlign: "center" }}>
          Our engineering approach evaluates sector-specific constraints to deliver tailored robotic platforms, hands-on institutional programmes, and industrial automation deployments.
        </div>
      </div>
    </section>
  );
}
