"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Level = "Intermediate" | "Advanced" | "Expert";

type Project = {
  title: string;
  track: string;
  level: Level;
  hook: string;
  challenge: string;
  components: string[];
  skills: string[];
  tools: string;
};

const PROJECTS: Project[] = [
  {
    title: "Self-Balancing Stepper Robot",
    track: "Control",
    level: "Advanced",
    hook: "Keep an inherently unstable robot perfectly upright with real-time PID control.",
    challenge:
      "Tuning precise PID loops and processing raw IMU data to keep an inherently unstable, inverted pendulum structure perfectly upright.",
    components: ["Arduino Nano", "MPU6050 6-axis IMU", "2× NEMA 17 steppers", "2× A4988 drivers", "3S LiPo", "Acrylic frame"],
    skills: ["PID tuning", "Sensor fusion", "Stepper motor control", "Real-time embedded C"],
    tools: "Embedded C, PID tuning, SolidWorks frame design, Python data plotting",
  },
  {
    title: "6-DOF Stewart Platform",
    track: "Kinematics",
    level: "Advanced",
    hook: "Build a motion simulator that moves in all six degrees of freedom.",
    challenge:
      "Mastering complex 3D spatial kinematics — calculating vector rotations and translations to control roll, pitch, yaw, heave, sway and surge.",
    components: ["ESP32 / Arduino Mega", "PCA9685 servo driver", "6× SG90 / MG90S servos", "Rod linkages", "3D-printed plates"],
    skills: ["3D kinematics", "Vector maths", "Multi-servo control", "Motion simulation"],
    tools: "SolidWorks plates and linkages, kinematics maths in Python, 3D printing",
  },
  {
    title: "Autonomous Maze Solver",
    track: "Autonomy",
    level: "Advanced",
    hook: "Map a maze, then race it again on the shortest path.",
    challenge:
      "Implementing Flood-Fill path planning and exact odometry to solve a maze, then run it again via the shortest route.",
    components: ["ESP32", "3× VL53L0X ToF sensors", "2× N20 encoder motors", "MX1508 driver", "Zero PCB"],
    skills: ["Flood-Fill algorithm", "Odometry", "ToF sensing", "Compact PCB soldering"],
    tools: "Embedded C/FreeRTOS, ROS 2 + Gazebo maze simulation, KiCad layout",
  },
  {
    title: "8-DOF Quadruped Spider",
    track: "Kinematics",
    level: "Advanced",
    hook: "Teach a four-legged robot to walk naturally.",
    challenge:
      "Developing gait sequencing (creep vs. trot) and leg inverse kinematics so the robot steps naturally without losing its center of gravity.",
    components: ["ESP32", "PCA9685 servo driver", "8× MG90S servos", "5V high-amp buck", "3D-printed chassis"],
    skills: ["Inverse kinematics", "Gait sequencing", "Centre-of-gravity control", "Power regulation"],
    tools: "SolidWorks chassis and legs, inverse kinematics in Python",
  },
  {
    title: "1D Flight Controller Testbed",
    track: "Flight",
    level: "Intermediate",
    hook: "Learn drone flight mechanics safely on a pivoting thrust beam.",
    challenge:
      "A safe way to learn drone flight mechanics — mount a motor on a pivoting beam and write custom flight-controller code to hold it level.",
    components: ["BLDC motor", "30A ESC", "MPU6050", "Arduino Nano", "Carbon / wooden beam", "Pivot base"],
    skills: ["Flight control loops", "BLDC and ESC control", "IMU processing", "Safe drone prototyping"],
    tools: "Embedded C, PID control, tuning plots in Python",
  },
  {
    title: "Long-Range Telemetry Rover",
    track: "Wireless & IoT",
    level: "Intermediate",
    hook: "Stream live sensor data from a rugged rover over long range.",
    challenge:
      "Handling packet loss over long distances, structuring multi-sensor telemetry payloads, and stabilizing power across voltage rails.",
    components: ["ESP32", "nRF24L01+PA+LNA", "BMP280", "MQ-2 gas sensor", "L298N", "High-torque DC motors"],
    skills: ["Long-range RF", "Telemetry protocols", "Industrial IoT sensing", "Power stabilisation"],
    tools: "FreeRTOS, RF telemetry, micro-ROS / MQTT dashboard",
  },
  {
    title: "Closed-Loop Mecanum Drive",
    track: "Kinematics",
    level: "Intermediate",
    hook: "Strafe sideways, move diagonally and spin on the spot with precision.",
    challenge:
      "Using encoder feedback and vector mathematics so the robot can strafe diagonally or rotate on its axis with absolute precision.",
    components: ["ESP32", "4× Mecanum wheels", "4× TT encoder motors", "2× L298N", "4WD chassis"],
    skills: ["Holonomic motion", "Encoder feedback", "Vector control", "Closed-loop drive"],
    tools: "Encoder control in Embedded C, ROS 2 teleoperation and RViz",
  },
  {
    title: "Edge-AI Voice Rover",
    track: "AI & Vision",
    level: "Intermediate",
    hook: "Command a robot by voice, with no internet needed.",
    challenge:
      "Deploying TensorFlow Lite on the robot to recognize wake words and directional commands locally — no internet required.",
    components: ["ESP32", "INMP441 I2S mic", "2WD chassis", "L298N mini", "2× DC motors"],
    skills: ["TinyML / TensorFlow Lite", "Audio processing", "On-device inference", "Motor control"],
    tools: "TensorFlow Lite model training, Embedded C",
  },
  {
    title: "Computer Vision Sorting Arm",
    track: "AI & Vision",
    level: "Advanced",
    hook: "A robotic arm that sees, decides and sorts objects by itself.",
    challenge:
      "Combining image processing with forward/inverse kinematics — the camera detects color or shape, the arm solves the angles to pick it up.",
    components: ["ESP32-CAM", "4-DOF acrylic arm", "4× MG996R servos", "PCA9685 driver"],
    skills: ["Computer vision", "Forward and inverse kinematics", "Pick-and-place logic", "Servo control"],
    tools: "OpenCV in Python, ESP32-CAM streaming, SolidWorks gripper",
  },
  {
    title: "Inverted Pendulum Cart-Pole",
    track: "Control",
    level: "Expert",
    hook: "Solve the classic cart-pole challenge of control theory.",
    challenge:
      "The classic control problem: a cart moves constantly along a rail to balance a free-swinging pole above it.",
    components: ["Arduino Uno", "NEMA 17 stepper", "GT2 belt & pulleys", "Aluminium extrusion rail", "Precision rotary encoder"],
    skills: ["Advanced control theory", "State estimation", "Linear motion systems", "Encoder feedback"],
    tools: "Embedded C, state estimation, Python simulation",
  },
  {
    title: "Leader-Follower Swarm Pair",
    track: "Wireless & IoT",
    level: "Advanced",
    hook: "Program two robots that move together as a team.",
    challenge:
      "Two robots communicate over an ESP-NOW mesh, moving in formation or avoiding each other based on shared coordinates.",
    components: ["2× ESP32-C3", "4× N20 motors", "2× compact drivers", "2× mini LiPo", "Custom frames (2 robots)"],
    skills: ["Multi-agent systems", "ESP-NOW mesh networking", "Formation control", "Swarm robotics"],
    tools: "ESP-NOW, micro-ROS, ROS 2 multi-robot visualisation",
  },
  {
    title: "2D Radar Mapping Scanner",
    track: "Autonomy",
    level: "Intermediate",
    hook: "Scan a room with a laser sensor and draw its map on your screen.",
    challenge:
      "Converting polar readings (angle + distance) into a 2D Cartesian map of the room, visualized on a PC with Python or Processing.",
    components: ["Arduino Nano", "VL53L0X ToF sensor", "SG90 180° servo", "HC-05 Bluetooth"],
    skills: ["Coordinate transforms", "Sensor mapping", "Bluetooth data streaming", "Python visualisation"],
    tools: "Python + OpenCV/Matplotlib mapping, Processing, Bluetooth",
  },
];

const TRACKS = ["All", ...new Set(PROJECTS.map((p) => p.track))];
const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  onNavigate: (t: string) => void;
  onLock: (locked: boolean) => void;
};

export default function Projects({ onNavigate, onLock }: Props) {
  const root = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [track, setTrack] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      gsap.from(".pj-head > *", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.utils.toArray<HTMLElement>(".pj-card").forEach((card, i) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 1,
          delay: (i % 3) * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%" },
        });
      });
    },
    { scope: root }
  );

  // Filtering changes the grid height, so later sections' triggers need re-measuring.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [track]);

  useEffect(() => {
    if (open === null) return;
    onLock(true);
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      onLock(false);
      opener.current?.focus({ preventScroll: true });
    };
  }, [open, onLock]);

  const p = open === null ? null : PROJECTS[open];

  return (
    <section className="section projects" id="projects" ref={root}>
      <div className="container">
        <div className="pj-head">
          <span className="section-tag">Phase 02 · The Project Matrix</span>
          <h2 className="h2">
            Choose your build.
            <br />
            <span className="accent">Take it home.</span>
          </h2>
          <p className="muted">
            Twelve projects engineered to teach control theory, kinematics, embedded systems and autonomous
            navigation — with professional-grade components, not toy kits. Every finished robot is yours to keep.
          </p>
        </div>

        <div className="pj-filters" role="group" aria-label="Filter projects by track">
          {TRACKS.map((t) => (
            <button key={t} type="button" aria-pressed={track === t} onClick={() => setTrack(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="pj-grid">
          {PROJECTS.map((p, i) => (
            <article key={p.title} className="pj-card" hidden={track !== "All" && p.track !== track}>
              <div className="pj-top">
                <span className="mono pj-idx">Project {pad(i + 1)}</span>
                <span className="mono pj-lvl" data-l={p.level}>
                  {p.level}
                </span>
              </div>
              <h3>{p.title}</h3>
              <p className="pj-challenge">{p.hook}</p>
              <ul className="pj-parts" aria-label="Key components">
                {p.components.slice(0, 4).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="pj-foot mono">
                <span className="muted">{p.track}</span>
                <button
                  type="button"
                  className="pj-more"
                  aria-haspopup="dialog"
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setOpen(i);
                  }}
                >
                  View build <span aria-hidden>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {p && (
        <div className="pj-modal" onClick={() => setOpen(null)}>
          <div
            className="pj-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pj-dialog-title"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pj-dialog-top">
              <div>
                <span className="mono pj-idx">
                  Project {pad(open! + 1)} · {p.track} · {p.level}
                </span>
                <h3 id="pj-dialog-title">{p.title}</h3>
              </div>
              <button ref={closeRef} type="button" className="pj-close" aria-label="Close" onClick={() => setOpen(null)}>
                ✕
              </button>
            </div>
            <div>
              <h4>The engineering challenge</h4>
              <p>{p.challenge}</p>
            </div>
            <div className="pj-cols">
              <div>
                <h4>Key components</h4>
                <ul>
                  {p.components.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Skills you&apos;ll master</h4>
                <ul>
                  {p.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4>Tools &amp; software</h4>
              <p>{p.tools}</p>
            </div>
            <p className="mono muted pj-note">
              Build it in Phase 2 (Months 4–5) under expert supervision. The finished robot is yours to keep.
            </p>
            <div className="pj-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setOpen(null);
                  onNavigate("#contact");
                }}
              >
                Reserve this project <span aria-hidden>→</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(null)}>
                Back to projects
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
