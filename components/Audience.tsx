"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const WHO = [
  "School students from Class 9 onwards with an interest in science and technology",
  "Diploma and B.Tech students in ECE, EE, ME, Mechatronics and CSE",
  "BCA, MCA and B.Sc. students moving into hardware and IoT",
  "Makers, hobbyists and teachers who want structured, practical training",
];

const INCLUDED = [
  "Lectures and lab sessions with mechatronics mentors",
  "Lab equipment, tools and test benches",
  "Hands-on training in ROS 2, SolidWorks, OpenCV and embedded systems",
  "A take-home robot you build yourself (kit purchased separately)",
  "Components for approved R&D projects",
  "Innovation and patent guidance",
  "An XAI Robotics certificate and a portfolio-ready build log",
];

const CAREERS = [
  ["Embedded Systems Engineer", "Design and program the electronics inside smart products."],
  ["Robotics Engineer", "Build and control robots for manufacturing, logistics and research."],
  ["IoT Developer", "Connect sensors and devices to networks and the cloud."],
  ["Automation Engineer", "Automate industrial processes with controllers and robotics."],
  ["Drone & UAV Technician", "Build, program and maintain unmanned aerial systems."],
  ["Edge-AI Developer", "Run machine-learning models on microcontrollers and devices."],
  ["ROS / Autonomous Systems Developer", "Build navigation, mapping and control software for autonomous robots."],
  ["Computer Vision Engineer", "Develop camera-based systems for inspection, sorting and tracking."],
  ["Mechanical Design (CAD) Engineer", "Design robot structures and products in SolidWorks."],
];

export default function Audience() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="audience" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">Is This For You?</span>
          <h2 className="h2 rv">
            Built for curious minds <span className="accent">at every stage.</span>
          </h2>
        </div>
        <div className="au-two">
          <div className="panel rv">
            <h3>Who can join</h3>
            <ul className="tick-list">
              {WHO.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="panel rv">
            <h3>What&apos;s included</h3>
            <ul className="tick-list">
              {INCLUDED.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="sub-h rv">Where robotics can take you</h3>
        <div className="au-careers">
          {CAREERS.map(([t, d], i) => (
            <div key={t} className="au-career rv">
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h4>{t}</h4>
                <p className="muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
