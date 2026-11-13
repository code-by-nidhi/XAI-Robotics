"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STATS = [
  { v: 1.2, d: 1, suffix: "M+", label: "Hours of autonomous operation" },
  { v: 0.02, d: 2, suffix: "mm", label: "Manipulation repeatability" },
  { v: 340, d: 0, suffix: "+", label: "Robots deployed in the field" },
  { v: 99.97, d: 2, suffix: "%", label: "Mission uptime across the fleet" },
];

function NeuralSphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0,
      h = 0,
      raf = 0,
      visible = true;

    const N = 1100;
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let ry = 0,
      rx = 0.35,
      mx = 0,
      my = 0;
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mx = ((e.clientX - b.left) / b.width - 0.5) * 2;
      my = ((e.clientY - b.top) / b.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const project = (x: number, y: number, z: number, R: number) => {
      const cy = Math.cos(ry),
        sy = Math.sin(ry),
        cx = Math.cos(rx),
        sx = Math.sin(rx);
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      const persp = 2.6 / (2.6 + z2);
      return { X: w / 2 + x1 * R * persp, Y: h / 2 + y1 * R * persp, z: z2, p: persp };
    };

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = time * 0.001;
      ry += 0.0035 + mx * 0.004;
      rx += (0.35 + my * 0.35 - rx) * 0.04;
      const R = Math.min(w, h) * 0.36;

      ctx.clearRect(0, 0, w, h);

      // Core glow
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, R * 0.9);
      g.addColorStop(0, "rgba(255, 255, 255, 0.24)");
      g.addColorStop(0.4, "rgba(160, 160, 160, 0.07)");
      g.addColorStop(1, "rgba(160, 160, 160, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Orbit rings
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        const tilt = k * 1.05 + t * 0.15;
        for (let a = 0; a <= 64; a++) {
          const th = (a / 64) * Math.PI * 2;
          const ox = Math.cos(th) * 1.25;
          const oy = Math.sin(th) * 1.25 * Math.sin(tilt);
          const oz = Math.sin(th) * 1.25 * Math.cos(tilt);
          const P = project(ox, oy, oz, R);
          if (a === 0) ctx.moveTo(P.X, P.Y);
          else ctx.lineTo(P.X, P.Y);
        }
        ctx.strokeStyle = `rgba(80,170,255,${0.1 + k * 0.04})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        const th = t * (0.6 + k * 0.25) + k * 2;
        const S = project(
          Math.cos(th) * 1.25,
          Math.sin(th) * 1.25 * Math.sin(tilt),
          Math.sin(th) * 1.25 * Math.cos(tilt),
          R
        );
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(S.X, S.Y, 2.6 * S.p, 0, Math.PI * 2);
        ctx.fill();
      }

      // Points with a travelling pulse
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const wave = 1 + Math.sin(t * 2 + p.y * 6 + p.x * 3) * 0.035;
        const P = project(p.x * wave, p.y * wave, p.z * wave, R);
        const depth = (1 - P.z) / 2;
        const a = 0.08 + depth * 0.85;
        ctx.fillStyle = `rgba(200,236,255,${a})`;
        const s = 0.6 + depth * 1.5;
        ctx.fillRect(P.X - s / 2, P.Y - s / 2, s, s);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="core-canvas" aria-hidden="true" />;
}

export default function Core() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".core-visual", {
        scale: 0.7,
        opacity: 0,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.from(".core-reveal", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".core-copy", start: "top 75%" },
      });
      gsap.utils.toArray<HTMLElement>(".stat-v").forEach((el, i) => {
        const s = STATS[i];
        const o = { v: 0 };
        gsap.to(o, {
          v: s.v,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => (el.textContent = o.v.toFixed(s.d)),
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="section core" id="core" ref={root}>
      <div className="container core-grid">
        <div className="core-visual">
          <NeuralSphere />
          <span className="core-label mono">NEURAL CORE · v4.2 · 1.1B PARAMS</span>
        </div>
        <div className="core-copy">
          <span className="section-tag core-reveal">[04] Intelligence</span>
          <h2 className="h2 core-reveal">
            A brain that <span className="accent">understands physics.</span>
          </h2>
          <p className="muted core-reveal">
            Our embodied foundation model fuses vision, language and touch into a single world representation. It
            runs fully on-device at 1 kHz — no cloud round-trip between thought and motion.
          </p>
          <div className="stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat core-reveal">
                <div className="stat-num">
                  <span className="stat-v">{(0).toFixed(s.d)}</span>
                  <span className="stat-s">{s.suffix}</span>
                </div>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
