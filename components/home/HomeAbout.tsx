"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";

export default function HomeAbout({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".ac-card");

  return (
    <section className="section hm" id="about" ref={root}>
      <div className="container">
        {/* Header with clean left/center balance */}
        <div className="hm-center" style={{ maxWidth: 880 }}>
          <span className="section-tag rv">About Us</span>
          <h2 className="h2 rv" style={{ textAlign: "center" }}>
            Where Artificial Intelligence Meets the Physical World
          </h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.14em" }}>
            Established August 2025 · Operating within the techcadd ecosystem
          </p>
          <p className="muted rv" style={{ fontSize: "16px", lineHeight: "1.75", textAlign: "center", maxWidth: 760 }}>
            <strong>X AI Robotics</strong> is a robotics-focused venture connecting digital intelligence with physical machines. 
            From autonomous quadruped robotics and computer vision to institutional university laboratories and hands-on 
            engineering programmes, we make emerging robotics accessible, tangible, and relevant to the real world.
          </p>
        </div>

        {/* Dynamic Asymmetric Engineering Collage */}
        <div className="about-collage">
          {/* Tile 1: Chi Chi Prototype in the Lab (Featured Wide Photo Card) */}
          <div className="ac-card ac-photo-card ac-card-span-7 rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/img21.png"
              alt="Chi Chi the AI quadruped robot dog prototype by X AI Robotics"
              className="ac-photo-img"
              loading="lazy"
            />
            <div className="ac-photo-overlay" />
            <div className="ac-photo-content">
              <div className="ac-top-bar">
                <span className="ac-chip mono">
                  <span className="pulse" /> PROTOTYPE // CHI CHI LAB
                </span>
                <span className="ac-chip mono ac-chip-dim">EST. AUG 2025</span>
              </div>
              <div className="ac-bottom-copy">
                <h3 className="ac-bottom-title">Physical Embodiment of AI</h3>
                <p className="ac-bottom-desc">
                  Chi Chi marked our defining beginning—demonstrating how mechanical structures, embedded systems,
                  actuators, sensors, and intelligent software converge in an agile physical robot.
                </p>
                <div className="ac-hud-stats">
                  <span>12-DOF QUADRUPED</span>
                  <span>•</span>
                  <span>EMBEDDED ROS 2</span>
                  <span>•</span>
                  <span>REAL-TIME VISION</span>
                  <span>•</span>
                  <span>DYNAMIC BALANCE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 2: Venture Identity & Engineering Pillars (Narrative Card) */}
          <div className="ac-card ac-narrative-card ac-card-span-5 rv">
            <div className="ac-narrative-head">
              <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
                01 // VENTURE IDENTITY
              </span>
              <h3 className="ac-narrative-title">The Complete Engineering Pipeline</h3>
              <p className="ac-narrative-text">
                At X AI Robotics, we believe a robot is not merely a mechanical frame. We emphasize understanding
                the full lifecycle—from CAD conceptualisation and circuit design to embedded programming, sensor fusion,
                assembly, testing, and practical demonstration.
              </p>
              <div className="ac-pill-tags">
                <span className="ac-pill">Mechanical &amp; CAD</span>
                <span className="ac-pill">Embedded Electronics</span>
                <span className="ac-pill">Sensor Fusion</span>
                <span className="ac-pill">ROS 2 &amp; AI Control</span>
                <span className="ac-pill">Computer Vision</span>
              </div>
            </div>

            <div className="ac-stat-strip">
              <div className="ac-stat-item">
                <span className="ac-stat-num">AUG 2025</span>
                <span className="ac-stat-label">Origin</span>
              </div>
              <div className="ac-stat-item">
                <span className="ac-stat-num">techcadd</span>
                <span className="ac-stat-label">Ecosystem</span>
              </div>
              <div className="ac-stat-item">
                <span className="ac-stat-num">100% HW</span>
                <span className="ac-stat-label">Hands-on</span>
              </div>
            </div>
          </div>

          {/* Tile 3: Campus Workshops & Institutional Labs (Photo Card) */}
          <div className="ac-card ac-photo-card ac-card-span-4 rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/image%202.jpg"
              alt="Engineering students and roboticists soldering and assembling hardware in laboratory"
              className="ac-photo-img"
              loading="lazy"
            />
            <div className="ac-photo-overlay" />
            <div className="ac-photo-content">
              <div className="ac-top-bar">
                <span className="ac-chip mono">
                  <span className="pulse" /> WORKSHOPS &amp; LABS
                </span>
              </div>
              <div className="ac-bottom-copy">
                <h3 className="ac-bottom-title">Institutional Engagement</h3>
                <p className="ac-bottom-desc">
                  Hands-on bootcamps, turnkey robotics laboratory setups, and technical mentorship for universities,
                  schools, and innovators across India.
                </p>
              </div>
            </div>
          </div>

          {/* Tile 4: Hardware Kinematics & Manipulator Spotlight (Render Card) */}
          <div className="ac-card ac-bot-card ac-card-span-4 rv">
            <div className="ac-top-bar">
              <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
                02 // HARDWARE
              </span>
              <span className="ac-chip mono" style={{ fontSize: "10px" }}>6-DOF ARM</span>
            </div>
            <div className="ac-bot-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/robot-arm.webp"
                alt="Multi-axis robotic arm manipulator"
                className="ac-bot-img"
                loading="lazy"
              />
            </div>
            <div className="ac-bottom-copy">
              <h3 className="ac-bottom-title" style={{ fontSize: "1.15rem" }}>Manipulators &amp; Kinematics</h3>
              <p className="ac-bottom-desc" style={{ fontSize: "13.5px" }}>
                Multi-axis forward &amp; inverse kinematics, payload dynamics, end-effector design, and automated control.
              </p>
            </div>
          </div>

          {/* Tile 5: Autonomous Locomotion & R&D Arena (Photo Card) */}
          <div className="ac-card ac-photo-card ac-card-span-4 rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/image%2018.jpg"
              alt="Founder demonstrating Chi Chi on stage during university robotics keynote"
              className="ac-photo-img"
              loading="lazy"
            />
            <div className="ac-photo-overlay" />
            <div className="ac-photo-content">
              <div className="ac-top-bar">
                <span className="ac-chip mono">
                  <span className="pulse" /> R&amp;D TESTING
                </span>
              </div>
              <div className="ac-bottom-copy">
                <h3 className="ac-bottom-title">Embodied Intelligence</h3>
                <p className="ac-bottom-desc">
                  Exploring bipedal balance, LiDAR point clouds, navigation in unmapped environments, and human-machine interaction.
                </p>
              </div>
            </div>
          </div>

          {/* Tile 6: Philosophy Quote & Navigation Banner (Full-Width Card) */}
          <div className="ac-card ac-quote-banner ac-card-span-12 rv">
            <div className="ac-quote-left">
              <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
                OUR PHILOSOPHY
              </span>
              <blockquote className="ac-quote-text">
                &ldquo;We envision X AI Robotics as a platform where curiosity meets engineering, education meets
                experimentation and technological ideas move towards practical applications.&rdquo;
              </blockquote>
            </div>

            <div className="ac-quote-right">
              <p className="muted" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Discover our complete 13-part narrative, origin story, safety guidelines, and ecosystem vision.
              </p>
              <div className="ac-actions">
                <a
                  href="/about-us"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("/about-us");
                  }}
                >
                  Explore Our Full Story <span aria-hidden>→</span>
                </a>
                <a
                  href="/services"
                  className="btn btn-ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("/services");
                  }}
                >
                  <span className="btn-dot" /> Robotics Services
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
