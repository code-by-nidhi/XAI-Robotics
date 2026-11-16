"use client";

import { useState, useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";

export interface ChronicleItem {
  id: string;
  file: string;
  category: "keynotes" | "campus" | "lab" | "chichi";
  tag: string;
  title: string;
  caption: string;
  location: string;
  spanClass: string;
  objectPosition?: string;
}

const CHRONICLE_ITEMS: ChronicleItem[] = [
  {
    id: "handstand-demo",
    file: "image 9.jpg",
    category: "chichi",
    tag: "DYNAMIC INVERSE KINEMATICS",
    title: "Dynamic Two-Limb Balance on Stage",
    caption:
      "Chi Chi executing an agile two-limb handstand pose during a live keynote presentation by the founder, demonstrating high-frequency stabilization and active attitude control.",
    location: "Main Auditorium · Tech Showcase",
    spanClass: "chronicle-span-hero",
    objectPosition: "center 4%",
  },
  {
    id: "lab-soldering",
    file: "image 2.jpg",
    category: "lab",
    tag: "HANDS-ON HARDWARE R&D",
    title: "Circuit Assembly & Actuator Calibration",
    caption:
      "Engineering students and researchers in our techcadd robotics laboratory soldering circuit boards, debugging real-time buses, and testing articulated motor linkages.",
    location: "Robotics Incubation Lab",
    spanClass: "chronicle-span-tall",
    objectPosition: "center 18%",
  },
  {
    id: "chichi-outdoor",
    file: "img21.png",
    category: "chichi",
    tag: "12-DOF QUADRUPED PROTOTYPE",
    title: "Chi Chi: Outdoor Field Proving Ground",
    caption:
      "High-definition field testing of Chi Chi the quadruped robot dog featuring lightweight aerospace-grade alloys, high-torque smart actuators, and onboard ROS 2 compute.",
    location: "Field Testing Arena",
    spanClass: "chronicle-span-wide",
    objectPosition: "center center",
  },
  {
    id: "founder-keynote",
    file: "image 18.jpg",
    category: "keynotes",
    tag: "LEADERSHIP KEYNOTE",
    title: "Bridging Digital AI with Physical Machines",
    caption:
      "The founder addressing a packed auditorium alongside Chi Chi, sharing our core mission to make robotics education and autonomous engineering accessible across India.",
    location: "National Technology Convention",
    spanClass: "chronicle-span-standard",
    objectPosition: "center 10%",
  },
  {
    id: "cgc-partnership",
    file: "image 7.jpg",
    category: "campus",
    tag: "INSTITUTIONAL ALLIANCE",
    title: "CGC Landran Academic Partnership",
    caption:
      "Unveiling joint robotics initiatives with the Department of Emerging Technologies at Chandigarh Engineering College (CEC), Landran, Mohali.",
    location: "CEC Landran · Mohali",
    spanClass: "chronicle-span-wide",
    objectPosition: "center 30%",
  },
  {
    id: "student-interaction",
    file: "image 10.jpg",
    category: "chichi",
    tag: "HUMAN-ROBOT INTERACTION",
    title: "Interactive Campus Demonstration",
    caption:
      "A student interacting directly with Chi Chi on campus—demonstrating real-time vision tracking, gesture recognition, and responsive quadruped social engagement.",
    location: "Campus Proving Ground",
    spanClass: "chronicle-span-standard",
    objectPosition: "center 35%",
  },
  {
    id: "mou-signing",
    file: "image 4.jpg",
    category: "campus",
    tag: "STRATEGIC MOU SIGNING",
    title: "AI Unleashed: Turnkey Lab Establishment",
    caption:
      "Formal MoU signing ceremony with university directors and academic leadership, establishing accredited robotics research labs and hands-on curricula.",
    location: "Executive Boardroom · CEC Mohali",
    spanClass: "chronicle-span-standard",
    objectPosition: "center 22%",
  },
  {
    id: "cohort-stage",
    file: "image 16.jpg",
    category: "keynotes",
    tag: "STUDENT & FACULTY COHORT",
    title: "The Next Generation of Robotics Engineers",
    caption:
      "University professors, faculty mentors, student roboticists, and techcadd leadership united on stage with Chi Chi following an intensive technology showcase.",
    location: "Grand Auditorium Stage",
    spanClass: "chronicle-span-wide",
    objectPosition: "center center",
  },
  {
    id: "tech-award",
    file: "image 5.jpg",
    category: "keynotes",
    tag: "EXCELLENCE HONORS",
    title: "Institutional Innovation Recognition",
    caption:
      "Honored on stage by distinguished academic dignitaries for pioneering contributions to experiential robotics training and indigenous technology incubation.",
    location: "Annual Technology Summit",
    spanClass: "chronicle-span-standard",
    objectPosition: "center 22%",
  },
  {
    id: "student-auditorium",
    file: "image 3.jpg",
    category: "keynotes",
    tag: "COMMUNITY INSPIRATION",
    title: "Empowering 1,000+ Aspiring Engineers",
    caption:
      "Leadership receiving ceremonial honors in a filled university auditorium after demonstrating real-world autonomous rovers and robotics engineering pipelines.",
    location: "University Main Hall",
    spanClass: "chronicle-span-standard",
    objectPosition: "center 12%",
  },
];

const CATEGORIES = [
  { key: "all", label: "All Dispatches (10)" },
  { key: "chichi", label: "Chi Chi in Action" },
  { key: "lab", label: "Lab & Hardware R&D" },
  { key: "campus", label: "Campus Alliances & MoUs" },
  { key: "keynotes", label: "Keynotes & Summits" },
] as const;

export default function HomeChronicle() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".chronicle-card");

  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeModalItem, setActiveModalItem] = useState<ChronicleItem | null>(null);

  const filteredItems =
    activeTab === "all"
      ? CHRONICLE_ITEMS
      : CHRONICLE_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section className="section hm" id="chronicle" ref={root}>
      <div className="container">
        {/* Section Header */}
        <div className="hm-center" style={{ maxWidth: 880 }}>
          <span className="section-tag rv">Visual Dispatches · Proving Grounds</span>
          <h2 className="h2 rv">The Innovation Chronicle</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.14em" }}>
            Where Theory Meets Hardware · Authentic Moments Across Labs &amp; Campuses
          </p>
          <p className="muted rv" style={{ maxWidth: 780, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
            Robotics is not built in isolation. Explore genuine moments from our laboratories, keynote demonstrations,
            institutional MoU signings with leading universities, and hands-on student engineering sessions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="chronicle-filters rv">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`chronicle-filter-btn${activeTab === cat.key ? " is-active" : ""}`}
              onClick={() => setActiveTab(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Intact Bento Collage Grid */}
        <div className="chronicle-bento rv">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className={`chronicle-card ${item.spanClass}`}
              onClick={() => setActiveModalItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveModalItem(item);
                }
              }}
            >
              {/* Image with zoom effect, greyish/blackish thematic filter, and precise subject framing */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${encodeURIComponent(item.file)}`}
                alt={item.title}
                className="chronicle-img"
                style={{ objectPosition: item.objectPosition || "center top" }}
                loading="lazy"
              />

              {/* Thematic greyish/blackish tint overlay matching dark theme */}
              <div className="chronicle-overlay" />

              {/* Top Meta Bar */}
              <div className="chronicle-top-bar">
                <span className="ac-chip mono chronicle-chip">
                  <span className="pulse" /> {item.tag}
                </span>
                <span className="chronicle-loc-badge mono">{item.location}</span>
              </div>

              {/* Bottom Caption Info */}
              <div className="chronicle-bottom-info">
                <h3 className="chronicle-item-title">{item.title}</h3>
                <p className="chronicle-item-caption">{item.caption}</p>
                <div className="chronicle-action-cue mono">
                  <span>EXPAND ARTIFACT</span>
                  <span aria-hidden>↗</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Fullscreen Lightbox Modal */}
        {activeModalItem && (
          <div
            className="chronicle-lightbox"
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveModalItem(null)}
          >
            <div
              className="chronicle-lightbox-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="chronicle-lightbox-close"
                onClick={() => setActiveModalItem(null)}
                aria-label="Close image modal"
              >
                ✕
              </button>

              <div className="chronicle-lightbox-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${encodeURIComponent(activeModalItem.file)}`}
                  alt={activeModalItem.title}
                  className="chronicle-lightbox-img"
                  style={{ objectPosition: activeModalItem.objectPosition || "center top" }}
                />
              </div>

              <div className="chronicle-lightbox-body">
                <div className="chronicle-lightbox-meta mono">
                  <span className="ac-chip mono">
                    <span className="pulse" /> {activeModalItem.tag}
                  </span>
                  <span className="muted">{activeModalItem.location}</span>
                </div>
                <h3 className="chronicle-lightbox-title">{activeModalItem.title}</h3>
                <p className="chronicle-lightbox-desc">{activeModalItem.caption}</p>
                <div className="chronicle-lightbox-foot mono muted">
                  <span>X AI ROBOTICS · AUTHENTIC FIELD ARCHIVE</span>
                  <span>EST. AUGUST 2025</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
