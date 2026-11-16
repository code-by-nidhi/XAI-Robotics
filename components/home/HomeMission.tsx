"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export interface MissionItem {
  num: string;
  eyebrow: string;
  title: string;
  desc: string;
  tags: string[];
}

const MISSIONS: MissionItem[] = [
  {
    num: "01",
    eyebrow: "PRACTICAL FOUNDATION",
    title: "Promote Practical Robotics and Engineering",
    desc: "Create opportunities for learners and institutions to experience robotics through practical training, hands-on projects, live demonstrations and structured technical programmes.",
    tags: ["Hands-On Hardware", "Project Builds", "Skill Mastery"],
  },
  {
    num: "02",
    eyebrow: "EMBODIED INTELLIGENCE",
    title: "Bridge Artificial Intelligence and Robotics",
    desc: "Encourage the integration of AI, machine learning, computer vision, embedded systems and robotic hardware to explore intelligent machines and emerging automation applications.",
    tags: ["Computer Vision", "ROS 2 Control", "Embodied AI"],
  },
  {
    num: "03",
    eyebrow: "NATIONAL IMPACT",
    title: "Strengthen India's Robotics Ecosystem",
    desc: "Contribute to India's growing robotics landscape by encouraging technical skills, engineering experimentation, institutional partnerships and indigenous technological innovation.",
    tags: ["Indigenous Tech", "Ecosystem Growth", "National Capability"],
  },
  {
    num: "04",
    eyebrow: "ACADEMIC COLLABORATION",
    title: "Support Institutional Robotics Development",
    desc: "Help schools, colleges, universities and educational organisations establish robotics laboratories, conduct workshops and introduce structured robotics programmes.",
    tags: ["Turnkey Labs", "Academic Integration", "Faculty Training"],
  },
  {
    num: "05",
    eyebrow: "INNOVATION & HARDWARE",
    title: "Encourage Research and Prototyping",
    desc: "Create opportunities for students, aspiring engineers and innovators to explore original concepts, develop functional prototypes and master the engineering pipeline.",
    tags: ["Rapid Prototyping", "Hardware Lab", "Research Mentorship"],
  },
  {
    num: "06",
    eyebrow: "APPLIED DEPLOYMENT",
    title: "Connect Technology with Industry Needs",
    desc: "Explore practical robotics applications across manufacturing, agriculture, logistics, healthcare support, education, infrastructure and smart automated operations.",
    tags: ["Industrial Automation", "Agri-Robotics", "Inspection Systems"],
  },
  {
    num: "07",
    eyebrow: "ETHICAL ENGINEERING",
    title: "Promote Responsible & Safe Robotics",
    desc: "Encourage safety-conscious engineering, responsible AI adoption, human oversight, ethical development and practical consideration of the real-world impact of robotic systems.",
    tags: ["Safety Protocols", "Human-Centric AI", "Ethical Engineering"],
  },
];

export default function HomeMission() {
  const root = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const pinned = pinnedRef.current;
      if (!track || !pinned) return;

      const getScrollDistance = () => {
        const padding = window.innerWidth > 900 ? 120 : 40;
        return Math.max(0, track.scrollWidth - window.innerWidth + padding);
      };

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: pinned,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 1.5, getScrollDistance() * 1.15)}`,
        pin: true,
        animation: tween,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    },
    { scope: root }
  );

  return (
    <section className="hm-mission-section" id="mission" ref={root}>
      <div className="hm-mission-pinned" ref={pinnedRef}>
        <div className="container hm-mission-container">
          {/* Header Bar */}
          <div className="hm-mission-top">
            <div className="hm-mission-head">
              <span className="section-tag">Our Mission</span>
              <h2 className="h2 hm-mission-title">
                Making Robotics Accessible · Advancing Intelligent Innovation
              </h2>
            </div>
          </div>

          {/* Scrollable Track with Pinned Horizontal Scrub */}
          <div className="hm-mission-track-wrap">
            <div className="hm-mission-track" ref={trackRef}>
              {MISSIONS.map((m) => (
                <article key={m.num} className="hm-mission-slide">
                  <div className="hm-slide-top">
                    <span className="ac-chip mono">
                      <span className="pulse" /> PILLAR {m.num}
                    </span>
                    <span className="hm-slide-num">{m.num}</span>
                  </div>

                  <div className="hm-slide-middle">
                    <span className="hm-slide-eyebrow">{m.eyebrow}</span>
                    <h3 className="hm-slide-title">{m.title}</h3>
                    <p className="hm-slide-desc">{m.desc}</p>
                  </div>

                  <div className="hm-slide-tags">
                    {m.tags.map((tag) => (
                      <span key={tag} className="hm-slide-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
