"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";
import { useServiceForm } from "../Shell";

const AUDIENCES = [
  "Schools and higher-secondary institutions",
  "Engineering colleges",
  "Universities",
  "Polytechnic and diploma institutions",
  "ITIs and skill-development centres",
  "Educational franchises",
  "Corporate learning and innovation teams",
];

const COLLABORATIONS = [
  "Live AI robot dog demonstrations featuring Chi Chi",
  "Introduction to robotics and intelligent systems",
  "Embedded systems and microcontroller workshops",
  "Robotics project bootcamps",
  "Computer vision and ROS 2 sessions",
  "Robotics laboratory establishment",
  "Faculty development and trainer orientation",
  "Long-term robotics programme partnerships",
];

export default function HomeCampuses() {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useReveal(root);
  useGsapTilt(root, ".sec-card");

  return (
    <section className="section hm" id="campuses" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Institutional Partnerships</span>
          <h2 className="h2 rv">Bringing Robotics to Campuses and Institutions</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
            Inspiring the Next Generation of Engineers and Innovators
          </p>
          <p className="muted rv" style={{ maxWidth: 840, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
            The future of robotics depends on access to technology, practical exposure and opportunities to experiment. X AI Robotics works towards bringing robotics experiences closer to students and educational communities through demonstrations, workshops, bootcamps and institutional collaborations.
          </p>
        </div>

        <div className="sec-grid-2 rv" style={{ marginTop: "48px" }}>
          <div className="sec-card">
            <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
              Tailored Environments
            </span>
            <h3 className="sec-card-title">Our programmes can be designed for:</h3>
            <ul className="sec-list-disc" style={{ marginTop: "12px" }}>
              {AUDIENCES.map((aud, idx) => (
                <li key={idx} style={{ color: "var(--text)" }}>
                  {aud}
                </li>
              ))}
            </ul>
          </div>

          <div className="sec-card">
            <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
              Partnership Scope
            </span>
            <h3 className="sec-card-title">Institutions can collaborate with us for:</h3>
            <ul className="sec-list-disc" style={{ marginTop: "12px" }}>
              {COLLABORATIONS.map((collab, idx) => (
                <li key={idx} style={{ color: "var(--text)" }}>
                  {collab}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sec-callout-banner rv">
          <p className="muted" style={{ fontSize: "16px" }}>
            We aim to make robotics an engaging, practical and accessible experience for learners while helping institutions introduce emerging technology into their educational environments.
          </p>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)" }}>
            Bring robotics to your institution. Let your students experience the technology shaping tomorrow.
          </p>
          <div style={{ marginTop: "8px" }}>
            <button type="button" className="btn btn-primary" onClick={openServiceForm}>
              Partner With X AI Robotics <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
