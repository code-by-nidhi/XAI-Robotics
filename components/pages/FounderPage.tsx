"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";
import { PageHero, Section, FaqBlock } from "../ui/Blocks";
import HomeClosing from "../home/HomeClosing";
import { useServiceForm, useGoClick } from "../Shell";
import type { FaqItem, SiteSettings } from "@/lib/cms";

const LEADERSHIP_PILLARS = [
  {
    num: "01",
    title: "Hands-On Engineering Over Theory",
    desc: "Robotics cannot be mastered solely through simulations or textbook slides. True mastery requires assembling actuators, tuning PID loops, debugging embedded serial buses, and working directly with real physical hardware.",
  },
  {
    num: "02",
    title: "Indigenous Technological Innovation",
    desc: "India has the engineering talent to lead the next century of robotics. Our leadership is committed to fostering indigenous design, local prototyping, and home-grown autonomous platforms rather than relying solely on imported systems.",
  },
  {
    num: "03",
    title: "Multidisciplinary Engineering Fusion",
    desc: "A robot is the ultimate convergence of mechanical design, electronic circuitry, firmware control, perception algorithms, and artificial intelligence. We cultivate engineers who understand how every layer communicates.",
  },
  {
    num: "04",
    title: "Democratizing Institutional Access",
    desc: "Advanced robotics must not be confined to elite laboratories. By establishing turnkey robotics labs and conducting intensive workshops across schools and universities, we bring cutting-edge robotics to every aspiring mind.",
  },
  {
    num: "05",
    title: "Human-Centric & Ethical Deployment",
    desc: "Intelligent machines must enhance human potential and solve real societal, agricultural, and industrial challenges. Safety, reliability, and human oversight guide every system we design and deploy.",
  },
];

const TIMELINE_MILESTONES = [
  {
    period: "August 2025",
    title: "Inception & Debut of Chi Chi",
    desc: "X AI Robotics was founded within the techcadd ecosystem, unveiling Chi Chi—our 12-DOF AI robot dog prototype demonstrating quadruped locomotion, embedded control, and computer vision.",
  },
  {
    period: "Late 2025",
    title: "Turnkey Academic Laboratory Framework",
    desc: "Formulated comprehensive laboratory blueprints and training curricula for colleges and schools, bridging the gap between collegiate curricula and industrial robotics requirements.",
  },
  {
    period: "Early 2026",
    title: "Industrial & Agricultural Automation Expansion",
    desc: "Broadened technical capabilities into industrial inspection, custom automated robotic arms, agricultural monitoring prototypes, and institutional faculty development programmes.",
  },
  {
    period: "2026 & Beyond",
    title: "National Robotics Ecosystem & Scaling",
    desc: "Deepening partnerships across Indian universities, expanding autonomous quadruped field research, and delivering turnkey industrial automation solutions across key manufacturing sectors.",
  },
];

export default function FounderPage({
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
    <main className="pg-founder" ref={root}>
      {/* Page Hero */}
      <PageHero
        eyebrow="Visionary Leadership · An Initiative of techcadd"
        title="Architecting India's Robotics Frontier"
        lede="Founded in August 2025 within the techcadd ecosystem, X AI Robotics was built on the core conviction that the future of intelligent machines belongs to those who dare to design, engineer, and build them."
        actions={[
          { label: "Request a Consultation", service: true },
          { label: "Explore Chi Chi Prototype", href: "/chi-chi", ghost: true },
        ]}
        stats={[
          ["Aug 2025", "Inception Date"],
          ["techcadd", "Parent Ecosystem"],
          ["12-DOF", "Chi Chi Quadruped"],
          ["Pan-India", "Campus Network"],
        ]}
      />

      {/* Section 1: The Leadership Manifesto & Vision */}
      <Section
        id="manifesto"
        tag="Founder's Perspective"
        title="From Vision to Physical Reality"
        lede="Bridging the gap between cutting-edge artificial intelligence and physical mechanical machines."
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {/* Main Leadership Quote Bubble */}
          <div
            className="sec-callout-banner rv"
            style={{
              padding: "36px 40px",
              background: "rgba(18, 18, 18, 0.8)",
              border: "1px solid rgba(var(--accent-rgb), 0.25)",
              borderRadius: "18px",
              marginBottom: "36px",
            }}
          >
            <p className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em", marginBottom: "12px" }}>
              LEADERSHIP STATEMENT
            </p>
            <blockquote style={{ fontSize: "20px", fontWeight: "500", color: "var(--text)", lineHeight: "1.6", margin: 0 }}>
              &ldquo;We don&apos;t just introduce people to robots. We help them understand, build and explore the technology behind them.&rdquo;
            </blockquote>
          </div>

          <div className="muted rv" style={{ fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "18px" }}>
              In August 2025, X AI Robotics was established with a singular mission: to bring robotics out of theoretical academia and into the hands of students, researchers, and enterprise innovators. As an initiative of the <strong>techcadd ecosystem</strong>, the venture combines decades of educational excellence with forward-looking engineering exploration.
            </p>
            <p style={{ marginBottom: "18px" }}>
              The journey started with a bold engineering statement: the development of <strong>Chi Chi</strong>, an advanced AI quadruped robot dog prototype. Rather than presenting abstract software algorithms, Chi Chi demonstrated the harmonious interplay of mechanical kinematics, torque-dense actuators, microcontrollers, ROS 2 middleware, and neural vision models.
            </p>
            <p style={{ marginBottom: "18px" }}>
              Under this visionary direction, X AI Robotics is not simply building products—it is laying the groundwork for a self-sustaining robotics ecosystem in India. By establishing modern campus laboratories, empowering educators, and providing turnkey industrial automation, we are preparing the next generation of engineers to lead the autonomous era.
            </p>
          </div>
        </div>
      </Section>

      {/* Section 2: 5 Pillars of Leadership Philosophy */}
      <Section
        id="leadership-pillars"
        tag="Core Philosophy"
        title="Five Principles That Guide Our Leadership"
        lede="The fundamental engineering tenets driving every project, partnership, and prototype."
      >
        <div className="sec-grid-3" style={{ marginTop: "32px" }}>
          {LEADERSHIP_PILLARS.map((p) => (
            <article key={p.num} className="sec-card rv" style={{ padding: "26px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span className="mono" style={{ fontSize: "11px", color: "var(--accent)", letterSpacing: "0.12em" }}>
                  PRINCIPLE {p.num}
                </span>
                <span className="sec-card-num" style={{ fontSize: "18px" }}>{p.num}</span>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "10px", color: "var(--text)" }}>
                {p.title}
              </h3>
              <p className="sec-card-text" style={{ fontSize: "14px", lineHeight: "1.65" }}>
                {p.desc}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* Section 3: Ecosystem Synergy with techcadd */}
      <Section
        id="techcadd-synergy"
        tag="Ecosystem Synergy"
        title="Powered by the techcadd Heritage"
        lede="Connecting institutional reach, technology training, and robotics innovation."
      >
        <div className="container hm-split" style={{ alignItems: "center" }}>
          <div className="hm-split-copy">
            <span className="section-tag rv">Strategic Foundation</span>
            <h3 className="h3 rv" style={{ textAlign: "left", marginBottom: "16px" }}>
              Where Education Meets Applied Robotics
            </h3>
            <p className="muted rv" style={{ fontSize: "15px", lineHeight: "1.75", marginBottom: "14px" }}>
              X AI Robotics operates with a distinct technological focus while drawing tremendous strength from its roots in the <strong>techcadd ecosystem</strong>.
            </p>
            <p className="muted rv" style={{ fontSize: "15px", lineHeight: "1.75", marginBottom: "14px" }}>
              This association enables us to deploy proven instructional frameworks, tap into established institutional networks across India, and scale robotics education far beyond isolated urban centers.
            </p>
            <p className="muted rv" style={{ fontSize: "15px", lineHeight: "1.75" }}>
              Together, we are transforming campuses into innovation hubs where students learn CAD modeling, embedded firmware, sensor fusion, and autonomous path planning under one comprehensive pipeline.
            </p>
          </div>

          <div className="rv">
            <div
              className="sec-card"
              style={{
                padding: "32px",
                background: "linear-gradient(145deg, rgba(20,20,20,0.85) 0%, rgba(10,10,10,0.95) 100%)",
                border: "1px solid rgba(var(--accent-rgb), 0.2)",
              }}
            >
              <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
                ECOSYSTEM HIGHLIGHTS
              </span>
              <ul className="sec-list-disc" style={{ marginTop: "16px" }}>
                <li style={{ fontSize: "14.5px", marginBottom: "12px", color: "var(--text)" }}>
                  <strong>Educational Pedagogy:</strong> Proven experiential learning methodologies adapted for advanced robotics.
                </li>
                <li style={{ fontSize: "14.5px", marginBottom: "12px", color: "var(--text)" }}>
                  <strong>Turnkey Lab Deployments:</strong> Complete hardware, workstations, sensors, and safety infrastructure for colleges.
                </li>
                <li style={{ fontSize: "14.5px", marginBottom: "12px", color: "var(--text)" }}>
                  <strong>Faculty Enablement:</strong> Structured orientation programmes to upskill academic mentors in modern ROS 2 and AI.
                </li>
                <li style={{ fontSize: "14.5px", color: "var(--text)" }}>
                  <strong>Industry Alignment:</strong> Direct pathways connecting trained students with robotics and automation employers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 4: Journey & Timeline */}
      <Section
        id="journey"
        tag="Milestones"
        title="Our Growth Trajectory"
        lede="Key milestones in our mission to revolutionize robotics in India."
      >
        <div style={{ maxWidth: 840, margin: "32px auto 0" }}>
          {TIMELINE_MILESTONES.map((m, idx) => (
            <div
              key={m.period}
              className="rv"
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                gap: "24px",
                padding: "24px 0",
                borderBottom: idx < TIMELINE_MILESTONES.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <div>
                <span className="ac-chip mono" style={{ fontSize: "11px" }}>
                  <span className="pulse" /> {m.period}
                </span>
              </div>
              <div>
                <h4 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--text)", marginBottom: "8px" }}>
                  {m.title}
                </h4>
                <p className="muted" style={{ fontSize: "14.5px", lineHeight: "1.65" }}>
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
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
            EXECUTIVE INQUIRY
          </span>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text)", marginBottom: "12px" }}>
            Collaborate Directly with Leadership
          </h3>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "24px", fontSize: "15px", lineHeight: "1.6" }}>
            Interested in institutional robotics lab consulting, university keynote lectures, or joint R&D projects? Reach out to discuss how X AI Robotics can empower your organization.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="btn btn-primary" onClick={openService}>
              Request Leadership Consultation →
            </button>
            <a href="/contact" onClick={goClick("/contact")} className="btn btn-ghost">
              <span className="btn-dot" /> Contact Office
            </a>
          </div>
        </div>
      </Section>

      {/* Relevant FAQs */}
      <FaqBlock
        items={faqs.slice(0, 5)}
        lede="Frequently asked questions about X AI Robotics leadership, origins, and ecosystem partnerships."
      />

      {/* Closing Social & Contact */}
      <HomeClosing social={site.social} />
    </main>
  );
}
