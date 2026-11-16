"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";
import { useServiceForm } from "../Shell";
import { SERVICE_OPTIONS } from "../ServiceModal";

export interface ServiceItem {
  num: string;
  title: (typeof SERVICE_OPTIONS)[number];
  eyebrow: string;
  tagline: string;
  desc: string;
  bullets: string[];
  tag: string;
}

const SERVICES: ServiceItem[] = [
  {
    num: "01",
    title: "Education & Skill Development",
    eyebrow: "ACADEMIC & TALENT FOUNDATION",
    tagline: "Courses, workshops, STEM, robotics labs and certifications.",
    desc: "Comprehensive robotics training designed to develop practical hardware and software proficiency. From our intensive six-month robotics programme to university workshops and school bootcamps, we train learners on real hardware across embedded systems, ROS 2, SolidWorks CAD, OpenCV vision, and intelligent motion control.",
    bullets: [
      "Specialised Robotics Courses & Flagship Programme",
      "Hands-On Workshops & Bootcamps",
      "STEM & School Robotics Curricula",
      "Turnkey Robotics Labs & Setups",
      "Recognised Technical Certifications",
    ],
    tag: "Hands-On Hardware",
  },
  {
    num: "02",
    title: "Industrial Automation",
    eyebrow: "OPERATIONS & SMART MANUFACTURING",
    tagline: "Robotic arms, cobots, AMRs and smart manufacturing.",
    desc: "Practical robotics engineering for manufacturing and operational environments. We design, configure, and integrate multi-axis robotic arms, automated pick-and-place workcells, smart conveyor inspection, custom end-effectors, and PLC-controlled systems that increase throughput and operational reliability.",
    bullets: [
      "Multi-Axis Robotic Arms (6-DoF)",
      "Collaborative Robots (Cobots)",
      "Autonomous Mobile Robots (AMRs)",
      "Smart Manufacturing & Quality Control",
      "Custom End-Effectors & PLC Integration",
    ],
    tag: "Kinematics & Precision",
  },
  {
    num: "03",
    title: "AI & Autonomous Systems",
    eyebrow: "EMBODIED COGNITION & PERCEPTION",
    tagline: "AI robotics, drones, humanoids and computer vision.",
    desc: "Connecting artificial intelligence with physical embodiment. We develop autonomous mobile robots (AMRs), quadruped locomotion controllers, edge-computed computer vision, LiDAR mapping, and SLAM navigation algorithms that empower machines to perceive, reason, and navigate in unstructured environments.",
    bullets: [
      "Embodied AI Robotics Platforms",
      "Autonomous Drones & Aerial Systems",
      "Humanoids & Bipedal Research",
      "Computer Vision & Edge Perception (OpenCV)",
      "LiDAR SLAM & Autonomous Navigation",
    ],
    tag: "Embodied Intelligence",
  },
  {
    num: "04",
    title: "Robotics Products & Distribution",
    eyebrow: "HARDWARE & LAB INFRASTRUCTURE",
    tagline: "Import, supply, installation and authorised dealership.",
    desc: "Turnkey equipment supply, modular educational kits, and certified robotic platforms for institutions, research labs, and commercial clients. We provide authentic, high-reliability robotics components, development kits, sensors, motors, and turnkey laboratory packages backed by end-to-end technical support.",
    bullets: [
      "Global Hardware Import & Logistics",
      "Platform & Component Supply",
      "On-Site Installation & Calibration",
      "Authorised Dealership & Warranties",
      "Turnkey Laboratory Equipment Packages",
    ],
    tag: "Turnkey Hardware",
  },
  {
    num: "05",
    title: "Research & Development",
    eyebrow: "INNOVATION & EXPERIMENTAL PROTOTYPING",
    tagline: "Custom robots, prototypes, engineering and innovation projects",
    desc: "Dedicated incubation and engineering mentorship to transform ambitious robotics concepts into validated prototypes. Approved projects receive dedicated lab bench access, component issues, CAD design assistance, firmware development, and rigorous physical testing.",
    bullets: [
      "Custom Robot Engineering",
      "Proof-of-Concept & Prototypes",
      "Mechanical CAD & Embedded Engineering",
      "Collaborative Innovation Projects",
      "Applied Research & Incubation",
    ],
    tag: "Rapid Prototyping",
  },
];

export default function HomeServices({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useReveal(root);
  useGsapTilt(root, ".sec-card");

  return (
    <section className="section hm" id="services" ref={root}>
      <div className="container">
        {/* Header */}
        <div className="hm-head">
          <div>
            <span className="section-tag rv">Our Robotics Services</span>
            <h2 className="h2 rv">Comprehensive Robotics Solutions</h2>
            <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em", marginTop: "4px" }}>
              For Education, Institutions and Emerging Industries
            </p>
          </div>
          <div className="hm-head-side rv">
            <p className="muted">
              X AI Robotics brings together technical expertise, practical engineering, and turnkey services to help
              individuals, academic institutions, and businesses explore and deploy intelligent machines.
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => openServiceForm()}>
              <span className="btn-dot" /> Request a Service
            </button>
          </div>
        </div>

        {/* 5-Service Grid matching popup modal options */}
        <div className="hm-services-grid rv">
          {SERVICES.map((s, idx) => {
            // First 3 cards span 2 columns each (row of 3), next 2 cards span 3 columns each (row of 2)
            const colClass = idx < 3 ? "hm-svc-card-col-2" : "hm-svc-card-col-3";
            return (
              <article
                key={s.num}
                className={`sec-card ${colClass}`}
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span className="sec-card-num">{s.num}</span>
                    <span className="ac-chip mono" style={{ fontSize: "10px", padding: "4px 10px" }}>
                      {s.tag}
                    </span>
                  </div>

                  <span className="mono muted" style={{ fontSize: "10.5px", letterSpacing: "0.14em" }}>
                    {s.eyebrow}
                  </span>

                  <h3 className="sec-card-title" style={{ fontSize: "1.25rem", margin: "6px 0 4px" }}>
                    {s.title}
                  </h3>

                  <p
                    className="mono"
                    style={{
                      fontSize: "12px",
                      color: "var(--accent)",
                      letterSpacing: "0.02em",
                      marginBottom: "10px",
                      lineHeight: "1.5",
                    }}
                  >
                    {s.tagline}
                  </p>

                  <p className="sec-card-text" style={{ fontSize: "14px", lineHeight: "1.65" }}>
                    {s.desc}
                  </p>

                  <ul className="sec-list-disc" style={{ marginTop: "16px", marginBottom: "20px" }}>
                    {s.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ fontSize: "13px", lineHeight: "1.6" }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    padding: "10px 18px",
                    fontSize: "12px",
                    marginTop: "8px",
                  }}
                  onClick={() => openServiceForm(s.title)}
                >
                  <span>Enquire For This Service</span>
                  <span aria-hidden>→</span>
                </button>
              </article>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="sec-callout-banner rv" style={{ marginTop: "44px" }}>
          <p className="muted" style={{ fontSize: "16px" }}>
            &ldquo;From a single hands-on robotics workshop to a turnkey institutional robotics laboratory or custom
            industrial automation build, X AI Robotics provides end-to-end technical execution.&rdquo;
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
            <button type="button" className="btn btn-primary" onClick={() => openServiceForm()}>
              Request a Service <span aria-hidden>→</span>
            </button>
            <a
              href="/services"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/services");
              }}
            >
              <span className="btn-dot" /> View full service breakdown
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
