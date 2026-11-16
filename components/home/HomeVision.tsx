"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const ASPIRATIONS = [
  "Encourage the development and understanding of intelligent robotic systems.",
  "Support India's ambition to become a globally competitive robotics innovation and manufacturing ecosystem.",
  "Promote robotics applications that address Indian industrial, agricultural, educational and societal requirements.",
  "Encourage collaboration between educational institutions, engineers, technology companies and innovators.",
  "Develop a stronger culture of experimentation, prototyping and engineering entrepreneurship.",
  "Connect Indian robotics initiatives with global technological developments and best practices.",
  "Encourage responsible, safe and human-centred robotic technologies.",
];

export default function HomeVision() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section hm" id="vision-statement" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Our Vision</span>
          <h2 className="h2 rv">To Help Shape the Future of Robotics in India and Beyond.</h2>
          <div className="muted rv" style={{ maxWidth: 840, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
            <p style={{ marginBottom: "14px" }}>
              We envision a future where robotics becomes an integral part of everyday life, industrial development, scientific exploration, education and social progress.
            </p>
            <p style={{ marginBottom: "14px" }}>
              Across the world, robotics is evolving from conventional programmed machinery towards intelligent, adaptive and increasingly autonomous systems. Developments in artificial intelligence, advanced sensors, computer vision, edge computing, machine learning and real-time control are expanding the possibilities of what robots can accomplish.
            </p>
            <p style={{ marginBottom: "14px" }}>
              India has an important opportunity to participate in this transformation—not merely as a user of imported robotic technologies but as a contributor to research, design, engineering, development and manufacturing.
            </p>
            <p>
              Our vision is to become a meaningful contributor to this journey by supporting robotics awareness, technical capabilities, institutional infrastructure and innovation-driven projects.
            </p>
          </div>
        </div>

        <div className="rv" style={{ maxWidth: 900, margin: "48px auto 0" }}>
          <h3 className="mono muted" style={{ fontSize: "12px", letterSpacing: "0.14em", marginBottom: "20px", textAlign: "center" }}>
            We aspire to:
          </h3>
          <ul className="sec-list-disc sec-card" style={{ padding: "32px 36px" }}>
            {ASPIRATIONS.map((item, idx) => (
              <li key={idx} style={{ fontSize: "15.5px", color: "var(--text)" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="sec-callout-banner rv" style={{ maxWidth: 900, margin: "40px auto 0" }}>
          <p className="muted" style={{ fontSize: "16px", marginBottom: "10px" }}>
            We believe the future of robotics will not be shaped by machines alone. It will be shaped by the people who imagine, design, engineer, programme and responsibly deploy them.
          </p>
          <p style={{ fontSize: "17px", fontWeight: "600", color: "var(--text)" }}>
            Our vision is to help build that future—one intelligent machine, one innovation and one opportunity at a time.
          </p>
        </div>
      </div>
    </section>
  );
}
