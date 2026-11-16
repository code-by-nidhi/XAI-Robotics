"use client";

import type { FaqItem, SiteSettings, Testimonial } from "@/lib/cms";
import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import HomeTestimonials from "../home/HomeTestimonials";
import HomeClosing from "../home/HomeClosing";
import { FaqBlock, PageHero, Section } from "../ui/Blocks";
import { useServiceForm } from "../Shell";

const SERVICES = [
  {
    num: "01",
    image: "/images/image%202.jpg",
    imageAlt: "Students and researchers in the laboratory soldering and assembling robotics hardware",
    objectPosition: "center 20%",
    t: "Education & Skill Development",
    tagline: "Courses, workshops, STEM, robotics labs and certifications.",
    d: "Comprehensive educational programmes, institutional training, and technical skill development across robotics engineering and STEM disciplines.",
    points: [
      "Courses & Flagship Programmes",
      "Hands-On Workshops & Bootcamps",
      "STEM & School Robotics Curricula",
      "Turnkey Robotics Labs & Setups",
      "Recognised Technical Certifications",
    ],
    tag: "Education",
  },
  {
    num: "02",
    image: "/images/robotics-workshop.jpg",
    imageAlt: "Industrial automation robotic cells, workbenches and smart manufacturing infrastructure",
    objectPosition: "center center",
    t: "Industrial Automation",
    tagline: "Robotic arms, cobots, AMRs and smart manufacturing.",
    d: "Smart automation engineering and integration for modern manufacturing, precision material handling, and smart factory floor operations.",
    points: [
      "Multi-Axis Robotic Arms (6-DoF)",
      "Collaborative Robots (Cobots)",
      "Autonomous Mobile Robots (AMRs)",
      "Smart Manufacturing & Quality Inspection",
    ],
    tag: "Automation",
  },
  {
    num: "03",
    image: "/images/img21.png",
    imageAlt: "Chi Chi the autonomous AI quadruped robot dog platform with computer vision and SLAM",
    objectPosition: "center center",
    t: "AI & Autonomous Systems",
    tagline: "AI robotics, drones, humanoids and computer vision.",
    d: "Connecting artificial intelligence with physical embodiment to power perception, navigation, computer vision, and autonomous execution.",
    points: [
      "Embodied AI Robotics Platforms",
      "Autonomous Drones & Aerial Systems",
      "Humanoids & Bipedal Research",
      "Computer Vision & Edge Perception",
    ],
    tag: "AI & Autonomy",
  },
  {
    num: "04",
    image: "/images/image%204.jpg",
    imageAlt: "Official institutional robotics equipment supply and turnkey laboratory partnership ceremony",
    objectPosition: "center 22%",
    t: "Robotics Products & Distribution",
    tagline: "Import, supply, installation and authorised dealership.",
    d: "Authorised supply, distribution, and lifecycle deployment of authentic international robotics platforms, developer hardware, and modular lab kits.",
    points: [
      "Global Hardware Import & Customs",
      "Platform & Component Supply",
      "On-Site Installation & Calibration",
      "Authorised Dealership & Warranties",
    ],
    tag: "Distribution",
  },
  {
    num: "05",
    image: "/images/robotics-rd.jpg",
    imageAlt: "Applied robotics research & development facility with prototypes and testing arena",
    objectPosition: "center center",
    t: "Research & Development",
    tagline: "Custom robots, prototypes, engineering and innovation projects",
    d: "End-to-end prototyping and engineering incubation to transform original robotics concepts into tested, functional physical machines.",
    points: [
      "Custom Robot Engineering",
      "Proof-of-Concept & Prototypes",
      "Mechanical & Embedded Engineering",
      "Applied Innovation Projects",
    ],
    tag: "Applied R&D",
  },
];

const STEPS = [
  ["01", "Discover & Understand", "We begin by understanding the client's requirements, intended audience, technical interests and objectives."],
  ["02", "Evaluate & Plan", "We identify suitable robotics platforms, equipment, learning resources, technical approaches and implementation requirements."],
  ["03", "Design & Configure", "Where applicable, we help define laboratory layouts, project specifications, hardware configurations, workshop structures and technical workflows."],
  ["04", "Implement & Demonstrate", "We support the agreed activity through practical demonstrations, programme delivery, hardware setup, training or prototyping guidance."],
  ["05", "Test & Validate", "We emphasise practical testing, safe operation, troubleshooting and evaluation against the agreed objectives."],
  ["06", "Support & Improve", "We encourage ongoing technical engagement, learning and improvement through agreed support arrangements."],
];

function ServiceGrid() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const openServiceForm = useServiceForm();

  return (
    <section className="section hm" id="services" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Comprehensive Portfolio</span>
          <h2 className="h2 rv">Robotics Services Designed Around Different Needs</h2>
          <p className="muted rv" style={{ maxWidth: 760, margin: "14px auto 0" }}>
            From hands-on education and smart manufacturing to AI robotics, turnkey product distribution, and applied R&amp;D—explore our five core robotics service pillars.
          </p>
        </div>
        <div className="hm-services-grid rv" style={{ marginTop: "44px" }}>
          {SERVICES.map((s, idx) => {
            const colClass = idx < 3 ? "hm-svc-card-col-2" : "hm-svc-card-col-3";
            return (
              <article
                key={s.t}
                className={`hm-card ${colClass} rv`}
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div className="hm-card-media-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.imageAlt}
                      className="hm-card-photo-img"
                      style={{ objectPosition: s.objectPosition || "center" }}
                      loading="lazy"
                    />
                    <div className="hm-card-photo-overlay" />
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        zIndex: 2,
                      }}
                    >
                      <span
                        className="ac-chip mono"
                        style={{
                          fontSize: "10px",
                          padding: "4px 9px",
                          background: "rgba(10, 10, 10, 0.8)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                        }}
                      >
                        <span className="pulse" /> {s.tag}
                      </span>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "12px",
                        zIndex: 2,
                      }}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: "10.5px",
                          letterSpacing: "0.12em",
                          color: "rgba(255, 255, 255, 0.85)",
                          background: "rgba(0, 0, 0, 0.7)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        X AI · {s.num}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 10px",
                      marginBottom: "6px",
                    }}
                  >
                    <span className="mono" style={{ fontSize: "11px", color: "var(--accent)", letterSpacing: "0.12em" }}>
                      SERVICE {s.num} // CORE VERTICAL
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", margin: "4px 0" }}>{s.t}</h3>
                  <p
                    className="mono"
                    style={{
                      fontSize: "12px",
                      color: "var(--accent)",
                      letterSpacing: "0.02em",
                      padding: "0 10px",
                      margin: "4px 0 10px",
                      lineHeight: "1.5",
                    }}
                  >
                    {s.tagline}
                  </p>
                  <p className="muted" style={{ fontSize: "13.5px", lineHeight: "1.65" }}>
                    {s.d}
                  </p>
                  <ul className="pg-points" style={{ marginTop: "14px", marginBottom: "18px" }}>
                    {s.points.map((p) => (
                      <li key={p} className="mono">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "0 10px" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{
                      width: "100%",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      fontSize: "12px",
                      marginTop: "auto",
                    }}
                    onClick={() => openServiceForm(s.t)}
                  >
                    <span>Enquire For This Service</span>
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage({
  site,
  faqs,
  testimonials,
}: {
  site: SiteSettings;
  faqs: FaqItem[];
  testimonials: Testimonial[];
}) {
  const openServiceForm = useServiceForm();

  return (
    <main>
      <PageHero
        eyebrow="Comprehensive Robotics Solutions"
        title="Our Robotics Services"
        lede="Comprehensive Robotics Solutions for Education, Institutions and Emerging Industries. X AI Robotics brings together technical expertise, practical engineering and robotics-focused services to help individuals and organisations explore the possibilities of intelligent machines."
        actions={[
          { label: "Request a Service", service: true },
          { label: "See case studies", href: "/case-studies", ghost: true },
        ]}
        stats={[
          ["05 Services", "Core Focus Areas"],
          ["6 Steps", "Structured Lifecycle"],
          ["Aug 2025", "Est. X AI Robotics"],
        ]}
      />

      <ServiceGrid />

      <Section
        id="process"
        tag="Our Service Philosophy"
        title="From Concept to Practical Engagement"
        lede="We believe every robotics engagement should begin with an understanding of the intended purpose. Our service approach is designed around these differences."
      >
        <ol className="pg-steps">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="rv">
              <span className="mono muted">{n}</span>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="hm-band">
        <div className="container">
          <div className="hm-band-inner rv">
            <h2 className="h2">The Future Is Being Engineered Today.</h2>
            <p className="mono" style={{ fontSize: "14px", color: "var(--accent)" }}>
              Let&apos;s Build Something Intelligent Together.
            </p>
            <p className="muted" style={{ maxWidth: 760, fontSize: "16px", lineHeight: "1.7" }}>
              Whether you represent an educational institution, a business, a technology organisation or simply have an interest in robotics, X AI Robotics invites you to explore the possibilities of intelligent machines.
            </p>
            <div className="sec-quote-box" style={{ maxWidth: 640, margin: "14px 0 20px" }}>
              &ldquo;The next chapter of robotics begins with an idea. Let&apos;s engineer it together.&rdquo;
            </div>
            <div className="hm-actions">
              <button type="button" className="btn btn-primary" onClick={openServiceForm}>
                Request a Service <span aria-hidden>→</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={openServiceForm}>
                <span className="btn-dot" /> Book a Demonstration
              </button>
            </div>
          </div>
        </div>
      </section>

      <HomeTestimonials items={testimonials} />

      <FaqBlock items={faqs} lede="What people ask before joining a programme or booking a workshop." />

      <HomeClosing social={site.social} />
    </main>
  );
}
