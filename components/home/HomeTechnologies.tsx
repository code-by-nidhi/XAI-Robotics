"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt } from "@/lib/gsapEffects";

const TECH_ITEMS = [
  {
    title: "Embedded Systems & Microcontrollers",
    desc: "Explore how microcontrollers act as the control units of robotic systems. Work with ESP32 and Arduino platforms, GPIO, PWM, ADC, interrupts, communication protocols and real-time programming.",
    tags: ["ESP32", "Arduino", "GPIO / PWM", "Real-Time OS"],
  },
  {
    title: "Mechanical Design & CAD",
    desc: "Understand the mechanical structure of robots through part modelling, assemblies, motion studies, engineering drawings and design considerations using SolidWorks.",
    tags: ["SolidWorks", "Part Modelling", "Assemblies", "Motion Studies"],
  },
  {
    title: "Robotics Operating Systems",
    desc: "Explore ROS 2, nodes, topics, services, robot descriptions, transforms and simulation using Gazebo and RViz.",
    tags: ["ROS 2", "Gazebo", "RViz", "URDF"],
  },
  {
    title: "Computer Vision",
    desc: "Understand how robots interpret visual information through image processing, colour and shape detection, object tracking and ArUco marker localisation using OpenCV.",
    tags: ["OpenCV", "Object Tracking", "ArUco Markers", "Detection"],
  },
  {
    title: "Artificial Intelligence on Hardware",
    desc: "Explore TinyML and TensorFlow Lite applications for running selected machine-learning models on resource-constrained embedded devices.",
    tags: ["TinyML", "TensorFlow Lite", "Edge AI", "Neural Networks"],
  },
  {
    title: "Electronics, Sensors & Actuators",
    desc: "Learn how sensors collect environmental information and how motors, servo systems, drivers and actuators create physical movement.",
    tags: ["Sensors", "Servos & BLDC", "Motor Drivers", "Power Systems"],
  },
  {
    title: "Communication & Connectivity",
    desc: "Explore I2C, SPI, UART, Wi-Fi, Bluetooth, RF communication, ESP-NOW and related connectivity concepts used in robotic systems.",
    tags: ["I2C / SPI / UART", "Wi-Fi & BLE", "ESP-NOW", "RF"],
  },
  {
    title: "Engineering Development Tools",
    desc: "Work with Python, C/C++, Embedded C, FreeRTOS, micro-ROS, KiCad, Raspberry Pi, Linux, Git and related tools as appropriate to each project.",
    tags: ["Python / C++", "FreeRTOS", "micro-ROS", "Linux & Git"],
  },
];

export default function HomeTechnologies() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".sec-card");

  return (
    <section className="section hm" id="technologies" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">Technologies &amp; Capabilities</span>
          <h2 className="h2 rv">The Technologies Behind Intelligent Machines</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
            Engineering Across Multiple Disciplines
          </p>
          <p className="muted rv" style={{ maxWidth: 820, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
            Modern robotics is an interdisciplinary field. Every intelligent robotic system brings together different engineering disciplines that must work in coordination. At X AI Robotics, our robotics programme and technical development environment introduce participants to a range of technologies used in contemporary robotics engineering.
          </p>
        </div>

        <div className="sec-grid-4 rv" style={{ marginTop: "48px" }}>
          {TECH_ITEMS.map((item, idx) => (
            <article
              key={idx}
              className="sec-card"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <span className="sec-card-num">0{idx + 1}</span>
                <h3 className="sec-card-title" style={{ fontSize: "1rem", marginTop: "12px" }}>
                  {item.title}
                </h3>
                <p className="sec-card-text" style={{ fontSize: "13.5px", marginTop: "8px" }}>
                  {item.desc}
                </p>
              </div>
              <ul className="pg-chips" style={{ marginTop: "16px" }}>
                {item.tags.map((tag) => (
                  <li key={tag} className="mono" style={{ fontSize: "9.5px", padding: "4px 8px" }}>
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="sec-quote-box rv" style={{ maxWidth: 900, margin: "40px auto 0", textAlign: "center" }}>
          Our approach connects theory with physical implementation, allowing participants to understand how different engineering components combine to create a functional robotic system.
        </div>
      </div>
    </section>
  );
}
