"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/reveal";

const HW: Record<string, [string, string, string][]> = {
  Microcontrollers: [
    ["ESP32", "Wi-Fi + Bluetooth MCU", "The workhorse of most projects: dual-core, wireless and fast enough for real-time control."],
    ["ESP32-C3", "Compact RISC-V MCU", "Low-power boards used for the leader-follower swarm robots."],
    ["ESP32-CAM", "MCU + camera", "Gives the sorting arm its vision to detect colour and shape."],
    ["Arduino Nano / Uno / Mega", "Classic AVR boards", "Reliable boards for balancing, flight-testbed and radar projects."],
  ],
  Sensors: [
    ["MPU6050", "6-axis IMU", "Gyroscope and accelerometer that tell a robot how it is tilting and turning."],
    ["VL53L0X", "Time-of-Flight laser", "Precise distance sensing for maze-solving and room mapping."],
    ["Rotary encoders", "Position feedback", "Measure wheel and joint movement for closed-loop control."],
    ["BMP280 & MQ-2", "Pressure & gas", "Environmental sensing on the industrial telemetry rover."],
    ["INMP441", "I2S microphone", "Captures voice commands for on-device AI."],
  ],
  "Motors & Drivers": [
    ["NEMA 17 steppers", "Precision motors", "Exact, repeatable motion for balancing and cart-pole control."],
    ["MG90S / MG996R servos", "Positional servos", "Joints for the quadruped, Stewart platform and robotic arm."],
    ["BLDC + 30A ESC", "Brushless drive", "Drone-grade thrust for the flight-controller testbed."],
    ["N20 & TT gear motors", "DC drive", "Compact wheel motors, many with encoders."],
    ["A4988 · L298N · PCA9685", "Drivers", "Stepper, DC and 16-channel servo drivers that power the motion."],
  ],
  Communication: [
    ["nRF24L01+PA+LNA", "Long-range RF", "Streams telemetry over long distances."],
    ["ESP-NOW", "Mesh protocol", "Lets swarm robots share coordinates in real time."],
    ["HC-05", "Bluetooth", "Sends mapping data from the radar scanner to your PC."],
    ["I2C · SPI · UART", "Bus protocols", "How boards talk to sensors and drivers."],
  ],
  "Software & AI": [
    ["Embedded C/C++", "Firmware", "Real-time code that runs on every robot."],
    ["Python", "Analysis & visualisation", "Mapping, data plots and computer vision."],
    ["TensorFlow Lite", "TinyML", "Machine-learning models running directly on the ESP32."],
    ["PID & kinematics", "Control maths", "The algorithms that make robots balance, walk and reach."],
    ["ROS 2 & micro-ROS", "Robot middleware", "Connects sensors, motion and planning into one modular robot system."],
    ["OpenCV", "Computer vision", "Detects colours, shapes, markers and objects from camera images."],
    ["FreeRTOS", "Real-time OS", "Runs several tasks on the ESP32 at once, on time, every time."],
  ],
  "Design & Simulation": [
    ["SolidWorks", "3D CAD", "Design chassis, brackets, gears and mounts as parts and assemblies."],
    ["Gazebo & RViz", "Simulation", "Test robot behaviour and visualise sensor data before touching hardware."],
    ["KiCad", "PCB design", "Turn a breadboard prototype into a clean, custom circuit board."],
    ["3D printing & laser cutting", "Fabrication", "Produce the parts you designed, in hours rather than weeks."],
    ["Raspberry Pi", "Single-board computer", "Lab-provided host for ROS 2 and OpenCV processing."],
  ],
};
const KEYS = Object.keys(HW);

export default function Hardware() {
  const root = useRef<HTMLElement>(null);
  const [tab, setTab] = useState(KEYS[0]);
  useReveal(root);

  useGSAP(
    () => {
      gsap.from(".hw-item", { y: 16, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" });
    },
    { scope: root, dependencies: [tab] }
  );

  return (
    <section className="section ruled" id="hardware" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">Hardware You&apos;ll Master</span>
          <h2 className="h2 rv">
            Professional components, <span className="accent">not toy kits.</span>
          </h2>
          <p className="muted rv">
            These are the boards, sensors and actuators used across the 12 projects. Pick a category to explore.
          </p>
        </div>
        <div className="hw-tabs rv" role="tablist" aria-label="Hardware categories">
          {KEYS.map((k, i) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`hwt${i}`}
              aria-selected={tab === k}
              aria-controls="hw-panel"
              onClick={() => setTab(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="hw-panel" id="hw-panel" role="tabpanel" aria-labelledby={`hwt${KEYS.indexOf(tab)}`}>
          {HW[tab].map(([n, t, d]) => (
            <div key={n} className="panel hw-item">
              <span className="mono">{t}</span>
              <b>{n}</b>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
