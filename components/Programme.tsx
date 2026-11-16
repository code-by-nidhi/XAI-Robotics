"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/reveal";

const MONTHS = ["p1", "p1", "p1", "p2", "p2", "p3"];

const PHASES = [
  {
    key: "p1",
    tag: "Phase 01 · Foundation",
    when: "Months 1–3",
    t: "Core Robotics Curriculum",
    d: "Expert-led lectures and lab sessions that build the engineering base every robot depends on.",
    items: [
      "Microcontrollers: ESP32 and Arduino",
      "Sensors, actuators, motors and drivers",
      "Programming in C/C++ and Python",
      "Electronics, power and circuit fundamentals",
      "Control logic, PID and automation basics",
      "ROS 2, SolidWorks CAD and OpenCV vision",
    ],
    out: "The skills to wire, code and debug real embedded systems.",
  },
  {
    key: "p2",
    tag: "Phase 02 · Build",
    when: "Months 4–5",
    t: "Guided Take-Home Project",
    d: "Choose 1 project from our pool of 12. Build it under expert supervision, and take the robot home. It's yours to keep.",
    items: ["Pick from 12 industry-standard builds", "Professional-grade component kits", "Weekly mentor reviews and debugging"],
    out: "A working robot and a portfolio-ready build log.",
  },
  {
    key: "p3",
    tag: "Phase 03 · R&D",
    when: "Month 6 · Optional",
    t: "R&D Incubation",
    d: "Have an idea of your own? Propose it. We provide the components from our lab to bring your research to life.",
    items: ["Lab-issued components", "Engineer mentorship", "Innovation and patent guidance"],
    out: "An original prototype and research you can present.",
  },
];

const MODULES = [
  ["Electronics Essentials", "Circuits, Ohm's law, power supplies, voltage regulation, soldering and safe prototyping."],
  ["Microcontrollers", "Arduino Nano, Uno and Mega, and the ESP32 family: GPIO, PWM, ADC, timers and interrupts."],
  ["Programming for Robots", "Embedded C/C++ and Python: logic, functions, libraries and debugging on real hardware."],
  ["Sensors", "IMUs (MPU6050), ultrasonic, Time-of-Flight laser (VL53L0X), gas, pressure and encoders."],
  ["Motors & Actuators", "DC, servo, stepper (NEMA 17) and brushless motors, with drivers, ESCs and servo controllers."],
  ["Communication", "I2C, SPI, UART, Bluetooth, Wi-Fi, long-range RF (nRF24L01) and ESP-NOW mesh networking."],
  ["Control Systems", "Feedback loops, PID tuning, state machines and the maths behind motion and balance."],
  ["AI on Hardware", "TinyML with TensorFlow Lite: training small models and running them on the ESP32."],
  ["Embedded Deep Dive", "Embedded C, memory and peripherals, interrupts, FreeRTOS multitasking and hardware debugging."],
  ["CAD with SolidWorks", "3D part and assembly design for chassis, brackets and mounts, ready for 3D printing or laser cutting."],
  ["Computer Vision", "OpenCV image processing, colour and shape detection, object tracking and ArUco markers in Python."],
  ["ROS 2 & Simulation", "Nodes, topics and services, URDF robot models, Gazebo simulation, RViz and micro-ROS on ESP32."],
];

const FLOW = [
  ["Concept", "Understand the principle behind the task"],
  ["Wire", "Build the circuit on the bench"],
  ["Code", "Program the microcontroller"],
  ["Test", "Measure real sensor data"],
  ["Debug", "Find and fix what fails"],
  ["Document", "Log results in your build journal"],
];

export default function Programme() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      gsap.from(".pg-month i", {
        scaleX: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: ".pg-months", start: "top 85%" },
      });
      gsap.from(".pg-flow-line", {
        scaleX: 0,
        duration: 1.6,
        ease: "power2.inOut",
        scrollTrigger: { trigger: ".pg-flow", start: "top 80%" },
      });
    },
    { scope: root }
  );

  return (
    <section className="section ruled programme" id="programme" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">The 6-Month Programme</span>
          <h2 className="h2 rv">
            Learn it. Build it. <span className="accent">Invent with it.</span>
          </h2>
          <p className="muted rv">
            Three phases take you from your first sensor reading to independent research. Each phase builds on the
            last, so by Month 6 you are designing robots, not just assembling them.
          </p>
        </div>

        <div className="pg-months rv" aria-hidden="true">
          {MONTHS.map((p, i) => (
            <div key={i} className={`pg-month ${p}`}>
              <i />
              <span className="mono">M{i + 1}</span>
            </div>
          ))}
        </div>

        <div className="pg-phases">
          {PHASES.map((p) => (
            <article key={p.key} className={`panel pg-phase ${p.key} rv`}>
              <div className="pg-tag mono">
                <b>{p.tag}</b>
                <span className="muted">{p.when}</span>
              </div>
              <h3>{p.t}</h3>
              <p className="muted">{p.d}</p>
              <ul className="arrow-list">
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <div className="pg-out">
                <span className="mono muted">You walk away with</span>
                {p.out}
              </div>
            </article>
          ))}
        </div>

        <h3 className="sub-h rv">Phase 01 syllabus — 12 core modules</h3>
        <div className="pg-mods">
          {MODULES.map(([t, d], i) => (
            <div key={t} className="pg-mod rv">
              <span className="mono">Module {String(i + 1).padStart(2, "0")}</span>
              <h4>{t}</h4>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>

        <h3 className="sub-h rv">A session in the lab</h3>
        <p className="muted rv">Every class follows the engineering cycle real product teams use.</p>
        <div className="pg-flow">
          <span className="pg-flow-line" aria-hidden="true" />
          {FLOW.map(([t, d], i) => (
            <div key={t} className="pg-step rv">
              <span className="pg-dot mono">0{i + 1}</span>
              <h4>{t}</h4>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
