"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";
import { PageHero, Section, FaqBlock } from "../ui/Blocks";
import HomeMission from "../home/HomeMission";
import HomeVision from "../home/HomeVision";
import HomeClosing from "../home/HomeClosing";
import { useServiceForm, useGoClick } from "../Shell";
import type { FaqItem, SiteSettings } from "@/lib/cms";

const STRATEGIC_OBJECTIVES = [
  {
    num: "01",
    tag: "ACADEMIC COLLABORATION",
    title: "Turnkey Institutional Robotics Labs",
    desc: "Partnering with schools, colleges, and technical universities across India to establish modern robotics laboratories, equip faculty with advanced training, and introduce industry-aligned curriculum.",
  },
  {
    num: "02",
    tag: "EMBODIED AI & HARDWARE",
    title: "From Quadruped Locomotion to Real Systems",
    desc: "Translating theoretical AI, machine learning, and computer vision models into physical embodied systems, beginning with quadruped platforms like Chi Chi and scaling into specialized automation.",
  },
  {
    num: "03",
    tag: "INDIGENOUS CAPABILITY",
    title: "Strengthening India's Robotics Ecosystem",
    desc: "Fostering indigenous engineering research, hardware prototyping, and technical problem-solving to position India as a global robotics innovation and manufacturing contributor.",
  },
  {
    num: "04",
    tag: "RESPONSIBLE ENGINEERING",
    title: "Safety, Ethics & Human-Centric Automation",
    desc: "Advancing ethical engineering practices, human-supervised autonomy, safety protocols, and purposeful automation designed to uplift industries, agriculture, healthcare, and education.",
  },
];

export default function MissionVisionPage({
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
    <main className="pg-mission-vision" ref={root}>
      {/* Page Hero */}
      <PageHero
        eyebrow="Mission & Strategic Vision · Established August 2025"
        title="Engineering the Next Era of Robotics"
        lede="At X AI Robotics, our mission is to make advanced robotics accessible, practical, and impactful. Discover our 7 foundational mission pillars and our long-term vision to shape intelligent automation in India and beyond."
        actions={[
          { label: "Request a Service", service: true },
          { label: "Explore Our Prototype", href: "/chi-chi", ghost: true },
        ]}
        stats={[
          ["07", "Mission Pillars"],
          ["100%", "Hands-On Engineering"],
          ["Aug 2025", "Inception Milestone"],
          ["techcadd", "Innovation Ecosystem"],
        ]}
      />

      {/* Section 1: The Interactive Mission Slider */}
      <HomeMission />

      {/* Section 2: Strategic Vision */}
      <HomeVision />

      {/* Section 3: Strategic Objectives Grid */}
      <Section
        id="strategic-framework"
        tag="Strategic Framework"
        title="How We Execute Our Mission"
        lede="Connecting multidisciplinary engineering, institutional partnerships, and real-world deployment."
      >
        <div className="sec-grid-2" style={{ marginTop: "32px" }}>
          {STRATEGIC_OBJECTIVES.map((obj) => (
            <article key={obj.num} className="sec-card rv" style={{ padding: "28px 30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
                  {obj.tag}
                </span>
                <span className="sec-card-num" style={{ fontSize: "20px", color: "var(--accent)" }}>
                  {obj.num}
                </span>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "12px", color: "var(--text)" }}>
                {obj.title}
              </h3>
              <p className="sec-card-text" style={{ fontSize: "14.5px", lineHeight: "1.7" }}>
                {obj.desc}
              </p>
            </article>
          ))}
        </div>

        {/* Call to Action Banner */}
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
            PARTNER WITH US
          </span>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text)", marginBottom: "12px" }}>
            Join Us in Shaping India&apos;s Robotics Revolution
          </h3>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "24px", fontSize: "15px", lineHeight: "1.6" }}>
            Whether you represent a university looking to establish a state-of-the-art robotics lab or an industry looking to deploy autonomous automation, we are ready to collaborate.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="btn btn-primary" onClick={openService}>
              Partner With Us →
            </button>
            <a href="/founder" onClick={goClick("/founder")} className="btn btn-ghost">
              <span className="btn-dot" /> Meet Our Leadership
            </a>
          </div>
        </div>
      </Section>

      {/* Relevant FAQs */}
      <FaqBlock
        items={faqs.slice(0, 6)}
        lede="Common questions regarding our mission, institutional laboratory setups, and vision for Indian robotics."
      />

      {/* Closing Social & Contact */}
      <HomeClosing social={site.social} />
    </main>
  );
}
