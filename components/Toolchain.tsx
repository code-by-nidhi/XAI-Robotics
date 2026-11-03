"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const TOOLS = [
  {
    k: "Embedded",
    l: "Core skill",
    t: "Embedded Systems",
    d: "Program the brain of every robot. Go beyond Arduino sketches to write efficient firmware that talks directly to hardware.",
    items: [
      "Embedded C/C++ and MicroPython",
      "GPIO, timers, interrupts, PWM and ADC",
      "I2C, SPI and UART drivers",
      "FreeRTOS tasks, queues and real-time scheduling",
      "Debugging with serial logs and a logic analyser",
      "KiCad basics for custom PCB design",
    ],
    used: "All 12 projects",
  },
  {
    k: "ROS 2",
    l: "Autonomy",
    t: "Robot Operating System",
    d: "The open-source framework used by research labs and robotics companies to build modular, scalable robot software.",
    items: [
      "Nodes, topics, services and actions",
      "URDF robot description and transforms (tf2)",
      "Simulation in Gazebo and visualisation in RViz",
      "micro-ROS: connecting ESP32 robots to ROS 2",
      "Introduction to SLAM and the Nav2 navigation stack",
    ],
    used: "Mecanum Drive · Maze Solver · Swarm Pair · Telemetry Rover",
  },
  {
    k: "SolidWorks",
    l: "Mechanical design",
    t: "SolidWorks CAD",
    d: "Design the physical robot before you build it: parts, assemblies and motion, ready for manufacturing.",
    items: [
      "Sketching, part modelling and features",
      "Assemblies, mates and motion studies",
      "Designing chassis, brackets and sensor mounts",
      "Engineering drawings and tolerances",
      "Export for 3D printing and laser cutting",
    ],
    used: "Stewart Platform · Quadruped · Sorting Arm · Balancing Robot",
  },
  {
    k: "OpenCV",
    l: "Computer vision",
    t: "OpenCV Vision",
    d: "Give your robot eyes. Process camera images in Python to detect, track and make decisions about the world around it.",
    items: [
      "Image filtering, thresholding and colour spaces",
      "Contour, shape and colour detection",
      "Object tracking and ArUco marker localisation",
      "Streaming ESP32-CAM video to a PC or Raspberry Pi",
      "Combining vision with TinyML models",
    ],
    used: "Sorting Arm · Radar Mapping · R&D vision projects",
  },
];

const ALSO = [
  "Raspberry Pi",
  "Linux & terminal",
  "Git & GitHub",
  "Arduino IDE & PlatformIO",
  "Gazebo",
  "RViz",
  "KiCad",
  "3D printing (Cura)",
  "MQTT & IoT dashboards",
  "Python data plotting",
];

export default function Toolchain() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="toolchain" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">[08] The Industry Toolchain</span>
          <h2 className="h2 rv">
            The tools robotics companies <span className="accent">actually use.</span>
          </h2>
          <p className="muted rv">
            Building a robot takes more than wiring a board. You design the parts in CAD, write firmware for the
            microcontroller, give the robot eyes with computer vision, and connect everything with a robot operating
            system. You will practise every step of that workflow.
          </p>
        </div>
        <div className="tc-grid">
          {TOOLS.map((t) => (
            <article key={t.k} className="panel tc-tool rv">
              <div className="tc-top mono">
                <span className="tc-k">{t.k}</span>
                <span className="muted">{t.l}</span>
              </div>
              <h3>{t.t}</h3>
              <p className="muted">{t.d}</p>
              <ul className="arrow-list">
                {t.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <div className="tc-used">
                <b className="mono">Used in</b>
                {t.used}
              </div>
            </article>
          ))}
        </div>
        <div className="tc-also rv">
          <span className="mono muted">Also in your toolkit</span>
          <ul className="chips">
            {ALSO.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
