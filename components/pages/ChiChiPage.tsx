"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";
import ChiChi from "../ChiChi";
import { PageHero, Section, FaqBlock } from "../ui/Blocks";
import HomeClosing from "../home/HomeClosing";
import { useServiceForm, useGoClick } from "../Shell";
import type { FaqItem, SiteSettings } from "@/lib/cms";

const CHI_CHI_DISCIPLINES = [
  {
    num: "01",
    title: "Articulated Mechanical Structures",
    desc: "Precision lightweight chassis with high-strength linkages, low-friction bearings, and structural geometries optimized for dynamic impact resistance and agile quadruped locomotion.",
  },
  {
    num: "02",
    title: "High-Torque Actuator Systems",
    desc: "12 coordinated high-speed, high-torque smart actuators delivering precise angular positioning, rapid response times, and torque feedback across all 4 limbs (3 DOF per leg).",
  },
  {
    num: "03",
    title: "Embedded Control Electronics",
    desc: "Dedicated real-time microcontroller boards executing high-frequency low-level control loops, power distribution buses, and sensor sampling with sub-millisecond determinism.",
  },
  {
    num: "04",
    title: "Motion Planning & Dynamic Balance",
    desc: "Inverse kinematics algorithms, center-of-mass trajectory calculation, and active stabilization algorithms that compute foot placement and maintain balance over varying terrain.",
  },
  {
    num: "05",
    title: "Inertial (IMU) & Environmental Sensors",
    desc: "6-axis and 9-axis inertial measurement units combined with foot contact sensors and environmental telemetry for instantaneous pose estimation and attitude correction.",
  },
  {
    num: "06",
    title: "Wireless Telemetry & Control",
    desc: "Low-latency wireless communication links supporting bidirectional command input, telemetry streaming, system health diagnostics, and remote autonomous override.",
  },
  {
    num: "07",
    title: "Computer Vision & Perception",
    desc: "Onboard visual sensors and camera modules capable of obstacle detection, depth mapping, target tracking, and situational awareness for autonomous navigation.",
  },
  {
    num: "08",
    title: "Robotic Software & ROS 2 Architecture",
    desc: "Modular robotics software stack utilizing ROS 2 nodes for node-based sensor fusion, path planning, state machines, and seamless simulation integration in Gazebo.",
  },
];

const SPECS = [
  { label: "Locomotion Type", value: "12-DOF Quadruped Legged Locomotion" },
  { label: "Joint Actuation", value: "12 Smart High-Torque Servos (3 per leg)" },
  { label: "Kinematics Engine", value: "Real-Time 3D Inverse Kinematics" },
  { label: "Primary Compute", value: "Dual-tier: Embedded MCU + Linux SBC" },
  { label: "Perception & Vision", value: "Stereo / AI Depth Vision & Optical Flow" },
  { label: "Pose Sensing", value: "9-Axis High-Rate IMU (Gyro + Accel + Mag)" },
  { label: "Middleware Stack", value: "ROS 2 (Robot Operating System) + FreeRTOS" },
  { label: "Connectivity", value: "Dual-band Wi-Fi, BLE 5.0, Serial Bus" },
  { label: "Gait Modes", value: "Dynamic Trot, Static Walk, Crawl, Balance" },
  { label: "Inception Date", value: "August 2025 · X AI Robotics Prototype V1" },
];

export default function ChiChiPage({
  site,
  faqs,
}: {
  site: SiteSettings;
  faqs: FaqItem[];
}) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".sec-card");
  const openService = useServiceForm();
  const goClick = useGoClick();

  return (
    <main className="pg-chichi" ref={root}>
      {/* Page Hero */}
      <PageHero
        eyebrow="Flagship Prototype · Debuted August 2025"
        title="Chi Chi: The AI Robot Dog"
        lede="In August 2025, X AI Robotics introduced Chi Chi—a breakthrough quadruped robotic platform engineered to bring complex kinematics, embodied artificial intelligence, and multidisciplinary robotics into practical reality."
        actions={[
          { label: "Request a Campus Demo", service: true },
          { label: "Explore Our Mission", href: "/mission-vision", ghost: true },
        ]}
        stats={[
          ["12-DOF", "Articulated Limbs"],
          ["Aug 2025", "Public Unveiling"],
          ["ROS 2", "Robotics Stack"],
          ["100%", "Functional Prototype"],
        ]}
      />

      {/* Section 1: 3D Interactive Model Showcase */}
      <section className="section hm" id="viewer" style={{ paddingTop: "20px" }}>
        <div className="container">
          <div className="hm-center">
            <span className="section-tag rv">Interactive 3D Model</span>
            <h2 className="h2 rv">Explore the Chi Chi Platform</h2>
            <p className="muted rv" style={{ maxWidth: 700, margin: "12px auto 0", fontSize: "15px" }}>
              Rotate, inspect, and experience the quadruped engineering architecture that launched X AI Robotics.
            </p>
          </div>

          <div
            className="rv"
            style={{
              maxWidth: 960,
              margin: "36px auto 0",
              borderRadius: "24px",
              border: "1px solid rgba(var(--accent-rgb), 0.2)",
              background: "radial-gradient(ellipse at center, rgba(30,30,30,0.6) 0%, rgba(10,10,10,0.95) 100%)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.9)",
            }}
          >
            {/* Live Status Telemetry Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.4)",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pulse" />
                <span className="mono" style={{ fontSize: "11.5px", letterSpacing: "0.12em", color: "var(--accent)" }}>
                  CHI CHI TELEMETRY · PROTOTYPE V1
                </span>
              </div>
              <div className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
                12 MOTORS SYNCED · IMU CALIBRATED · ROS 2 ACTIVE
              </div>
            </div>

            {/* 3D Canvas Canvas Wrap */}
            <div style={{ width: "100%", height: "clamp(360px, 50vh, 520px)", position: "relative" }}>
              <ChiChi />
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.12em" }}>
                DRAG TO ORBIT · SCROLL TO ZOOM · INTERACTIVE PHYSICS KINEMATICS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Story of Chi Chi */}
      <Section
        id="story"
        tag="Origin Story"
        title="Why Chi Chi Was Built"
        lede="The pivotal milestone that gave our robotics venture its physical identity."
      >
        <div className="muted rv" style={{ maxWidth: 860, margin: "24px auto 0", fontSize: "16px", lineHeight: "1.8" }}>
          <p style={{ marginBottom: "16px" }}>
            Every meaningful technological venture has a defining moment that crystallizes its purpose. For X AI Robotics, that moment took place in <strong>August 2025</strong> with the introduction of <strong>Chi Chi</strong>, our new-age AI robot dog prototype.
          </p>
          <p style={{ marginBottom: "16px" }}>
            Quadruped robotics represents one of the most demanding frontiers in modern mobile robotics. Unlike conventional wheeled rovers that are restricted to smooth, prepared surfaces, legged locomotion allows robots to navigate varied terrain, step over obstacles, and traverse environments designed for living beings.
          </p>
          <p style={{ marginBottom: "16px" }}>
            Chi Chi was engineered not just as a laboratory experiment, but as an ambassador for practical robotics. When students and faculty watch Chi Chi balance, walk, and respond dynamically in real time, the mathematical abstraction of inverse kinematics, sensor loops, and motor control instantly becomes tangible and inspiring.
          </p>
          <p>
            The overwhelming response to Chi Chi led directly to the broader service vision of X AI Robotics—founding turnkey campus robotics labs, conducting hands-on engineering workshops, and exploring applied autonomous systems.
          </p>
        </div>

        <div className="sec-callout-banner rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
          <p className="muted" style={{ fontSize: "15px" }}>The defining milestone:</p>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)" }}>
            &ldquo;Chi Chi introduced the possibilities. X AI Robotics is committed to exploring what comes next.&rdquo;
          </p>
        </div>
      </Section>

      {/* Section 3: The 8 Engineering Disciplines */}
      <Section
        id="disciplines"
        tag="Engineering Breakdown"
        title="Eight Multidisciplinary Pillars Behind Chi Chi"
        lede="A harmonious fusion of mechanics, electronics, firmware, and artificial intelligence."
      >
        <div className="sec-grid-2" style={{ marginTop: "32px" }}>
          {CHI_CHI_DISCIPLINES.map((d) => (
            <article key={d.num} className="sec-card rv" style={{ padding: "26px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="mono" style={{ fontSize: "11px", color: "var(--accent)", letterSpacing: "0.12em" }}>
                  DISCIPLINE {d.num}
                </span>
                <span className="sec-card-num" style={{ fontSize: "18px" }}>{d.num}</span>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", marginBottom: "10px", color: "var(--text)" }}>
                {d.title}
              </h3>
              <p className="sec-card-text" style={{ fontSize: "14px", lineHeight: "1.65" }}>
                {d.desc}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* Section 4: Technical Specifications */}
      <Section
        id="specs"
        tag="Hardware & Software"
        title="Chi Chi Technical Specifications"
        lede="High-level hardware architecture and software engineering stack."
      >
        <div
          className="rv"
          style={{
            maxWidth: 900,
            margin: "32px auto 0",
            border: "1px solid rgba(var(--accent-rgb), 0.16)",
            borderRadius: "18px",
            background: "rgba(14, 14, 14, 0.75)",
            overflow: "hidden",
          }}
        >
          {SPECS.map((s, idx) => (
            <div
              key={s.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                padding: "16px 24px",
                borderBottom: idx < SPECS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                background: idx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
              }}
            >
              <span className="mono muted" style={{ fontSize: "13px" }}>
                {s.label}
              </span>
              <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text)" }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Demo Booking Callout */}
        <div
          className="sec-callout-banner rv"
          style={{
            maxWidth: 920,
            margin: "48px auto 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "40px 32px",
          }}
        >
          <span className="section-tag" style={{ marginBottom: "12px" }}>
            CAMPUS & EVENT SHOWCASES
          </span>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text)", marginBottom: "12px" }}>
            Bring Chi Chi to Your School, College or Event
          </h3>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "24px", fontSize: "15px", lineHeight: "1.6" }}>
            Experience live quadruped locomotion, real-time gait demonstrations, and interactive Q&A sessions with our robotics engineering team.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="btn btn-primary" onClick={openService}>
              Request Chi Chi Demonstration →
            </button>
            <a href="/founder" onClick={goClick("/founder")} className="btn btn-ghost">
              <span className="btn-dot" /> The Founder&apos;s Vision
            </a>
          </div>
        </div>
      </Section>

      {/* Relevant FAQs */}
      <FaqBlock
        items={faqs.slice(0, 5)}
        lede="Questions about Chi Chi, quadruped mechanics, robotics workshops, and demonstration requirements."
      />

      {/* Closing Social & Contact */}
      <HomeClosing social={site.social} />
    </main>
  );
}
