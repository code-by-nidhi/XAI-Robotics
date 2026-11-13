"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const SPECS = [
  { n: "01", t: "Rotary Base", d: "Continuous 360° turret on a cross-roller bearing. Zero backlash, zero drift." },
  { n: "02", t: "Shoulder Actuator", d: "Harmonic drive delivering 2.4 kN·m peak torque with integrated torque sensing." },
  { n: "03", t: "Elbow & Wrist", d: "Three-axis wrist with 1 kHz impedance control for contact-rich tasks." },
  { n: "04", t: "Adaptive Gripper", d: "Tactile fingertips resolve 0.1 N — firm enough for steel, gentle enough for glass." },
];

type Pose = { s: number; e: number; w: number; g: number; b: number };

// Joint angles (degrees) for each stage of the scroll sequence.
const POSES: Pose[] = [
  { s: -28, e: 135, w: -70, g: 0, b: 0 },
  { s: -12, e: 70, w: -30, g: 4, b: 120 },
  { s: 14, e: 42, w: 18, g: 14, b: 240 },
  { s: 24, e: 72, w: 50, g: 14, b: 300 },
  { s: 18, e: 60, w: 38, g: 0, b: 360 },
];

export default function Anatomy() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const shoulder = q(".j-shoulder")[0];
      const elbow = q(".j-elbow")[0];
      const wrist = q(".j-wrist")[0];
      const fl = q(".finger-l")[0];
      const fr = q(".finger-r")[0];
      const baseRing = q(".base-ring")[0];
      const readouts = q(".ang-val");

      const pose: Pose = { ...POSES[0] };
      const apply = () => {
        shoulder.setAttribute("transform", `rotate(${pose.s})`);
        elbow.setAttribute("transform", `rotate(${pose.e})`);
        wrist.setAttribute("transform", `rotate(${pose.w})`);
        fl.setAttribute("transform", `translate(${-pose.g} 0)`);
        fr.setAttribute("transform", `translate(${pose.g} 0)`);
        baseRing.setAttribute("transform", `rotate(${pose.b})`);
        [pose.b % 360, pose.s, pose.e, pose.w].forEach((v, i) => {
          if (readouts[i]) readouts[i].textContent = `${v >= 0 ? "+" : ""}${v.toFixed(1)}°`;
        });
      };
      apply();

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=320%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
        onUpdate: apply,
      });

      tl.from(".arm-part", { y: -80, opacity: 0, stagger: 0.25, duration: 0.6, ease: "power3.out" })
        .from(".arm-scan", { scaleX: 0, duration: 0.6 }, 0)
        .to(".a-progress-fill", { scaleY: 1, ease: "none", duration: 4 }, 0.6);

      SPECS.forEach((_, i) => {
        const at = 0.6 + i;
        tl.to(pose, { ...POSES[i + 1], duration: 1 }, at)
          .to(q(".spec")[i], { opacity: 1, x: 0, duration: 0.3 }, at)
          .to(q(".spec")[i], { "--active": 1, duration: 0.3 }, at);
        if (i > 0) tl.to(q(".spec")[i - 1], { opacity: 0.35, "--active": 0, duration: 0.3 }, at);
      });
    },
    { scope: root }
  );

  return (
    <section className="anatomy" id="anatomy" ref={root}>
      <div className="container anatomy-grid">
        <div className="a-head">
          <span className="section-tag">[02] Systems Anatomy</span>
          <h2 className="h2">
            Every joint, <span className="accent">engineered.</span>
          </h2>
        </div>

        <div className="a-stage">
          <div className="a-grid-bg" aria-hidden="true" />
          <span className="arm-scan" aria-hidden="true" />
          <div className="a-corner tl" />
          <div className="a-corner tr" />
          <div className="a-corner bl" />
          <div className="a-corner br" />
          <span className="a-label mono">KINETA A7 · LIVE KINEMATICS</span>

          <svg className="arm" viewBox="0 0 600 600" aria-label="Animated robotic arm">
            <defs>
              <linearGradient id="arm-chrome" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#292929" />
                <stop offset="0.35" stopColor="#f4f4f4" />
                <stop offset="0.55" stopColor="#8d8d8d" />
                <stop offset="1" stopColor="#1b1b1b" />
              </linearGradient>
              <radialGradient id="joint" cx="0.4" cy="0.35" r="0.7">
                <stop offset="0" stopColor="#f7f7f7" />
                <stop offset="0.5" stopColor="#797979" />
                <stop offset="1" stopColor="#181818" />
              </radialGradient>
            </defs>

            <ellipse cx="300" cy="548" rx="190" ry="18" fill="url(#joint)" opacity=".08" />
            <ellipse cx="300" cy="548" rx="120" ry="10" fill="none" stroke="rgba(255, 255, 255, .25)" strokeDasharray="3 6" />

            <g className="arm-part">
              <path d="M210 548 L390 548 L366 506 L234 506 Z" fill="url(#arm-chrome)" />
              <rect x="252" y="470" width="96" height="40" rx="6" fill="#131313" stroke="rgba(255, 255, 255, .35)" />
              <g transform="translate(300 490)">
                <g className="base-ring">
                  <circle r="14" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="10 5" />
                </g>
              </g>
            </g>

            <g transform="translate(300 470)">
              <g className="j-shoulder">
                <g className="arm-part">
                  <path d="M-26 0 L-22 -196 L22 -196 L26 0 Z" fill="url(#arm-chrome)" />
                  <path d="M-10 -30 L-8 -170 L8 -170 L10 -30 Z" fill="#0a0a0a" opacity=".55" />
                  <line x1="-24" y1="-100" x2="24" y2="-100" stroke="#070707" strokeWidth="2" />
                  <circle r="38" fill="url(#joint)" stroke="#070707" strokeWidth="3" />
                  <circle r="22" fill="#0f0f0f" stroke="rgba(255, 255, 255, .6)" strokeWidth="2" />
                  <circle r="6" fill="#ffffff" />
                </g>

                <g transform="translate(0 -200)">
                  <g className="j-elbow">
                    <g className="arm-part">
                      <path d="M-18 0 L-14 -160 L14 -160 L18 0 Z" fill="url(#arm-chrome)" />
                      <rect x="-5" y="-140" width="10" height="110" rx="5" fill="#0a0a0a" opacity=".55" />
                      <circle r="28" fill="url(#joint)" stroke="#070707" strokeWidth="3" />
                      <circle r="15" fill="#0f0f0f" stroke="rgba(255, 255, 255, .6)" strokeWidth="2" />
                      <circle r="4" fill="#ffffff" />
                    </g>

                    <g transform="translate(0 -162)">
                      <g className="j-wrist">
                        <g className="arm-part">
                          <rect x="-24" y="-40" width="48" height="26" rx="4" fill="url(#arm-chrome)" />
                          <rect x="-30" y="-48" width="60" height="10" rx="2" fill="#171717" stroke="rgba(255, 255, 255, .4)" />
                          <g className="finger-l">
                            <path d="M-28 -48 L-20 -48 L-18 -86 L-26 -92 Z" fill="url(#arm-chrome)" />
                          </g>
                          <g className="finger-r">
                            <path d="M28 -48 L20 -48 L18 -86 L26 -92 Z" fill="url(#arm-chrome)" />
                          </g>
                          <circle r="18" fill="url(#joint)" stroke="#070707" strokeWidth="3" />
                          <circle r="5" fill="#ffffff" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>

          <div className="a-readout mono">
            {["BASE θ0", "SHOULDER θ1", "ELBOW θ2", "WRIST θ3"].map((l) => (
              <div key={l}>
                <span>{l}</span>
                <b className="ang-val">+0.0°</b>
              </div>
            ))}
          </div>
        </div>

        <div className="a-specs">
          <div className="a-progress" aria-hidden="true">
            <span className="a-progress-fill" />
          </div>
          {SPECS.map((s) => (
            <article key={s.n} className="spec">
              <span className="spec-n mono">{s.n}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
