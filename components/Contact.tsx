"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const LINES = ["Let's build", "what moves", "next."];

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      gsap.from(".ct-line-inner", {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".ct-title", start: "top 80%" },
      });
      gsap.from(".ct-reveal", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ct-form", start: "top 85%" },
      });

      // Magnetic button
      const btn = root.current!.querySelector<HTMLElement>(".magnetic")!;
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const move = (e: MouseEvent) => {
        const b = btn.getBoundingClientRect();
        xTo((e.clientX - (b.left + b.width / 2)) * 0.35);
        yTo((e.clientY - (b.top + b.height / 2)) * 0.35);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      return () => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", leave);
      };
    },
    { scope: root }
  );

  return (
    <section className="section contact" id="contact" ref={root}>
      <div className="ct-glow" aria-hidden="true" />
      <div className="container">
        <span className="section-tag">[16] Contact</span>
        <h2 className="ct-title">
          {LINES.map((l, i) => (
            <span key={l} className="ct-line">
              <span className={`ct-line-inner ${i === 2 ? "accent" : ""}`}>{l}</span>
            </span>
          ))}
        </h2>

        <div className="ct-grid">
          <div className="ct-info">
            <p className="muted ct-reveal">
              Book a free lab tour, enrol in the programme, bring a workshop to your institution or deploy robots in
              industry — tell us a little about yourself and our team replies within 48 hours.
            </p>
            <a href="mailto:hello@xairobotics.com" className="ct-mail ct-reveal">
              hello@xairobotics.com
            </a>
            <div className="ct-meta mono muted ct-reveal">
              <span>HQ — San Francisco, CA</span>
              <span>LAB — Munich, DE</span>
            </div>
          </div>

          <form
            className="ct-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label className="field ct-reveal">
              <span>Name</span>
              <input required name="name" placeholder="Ada Lovelace" autoComplete="name" />
            </label>
            <label className="field ct-reveal">
              <span>Email</span>
              <input required type="email" name="email" placeholder="you@email.com" autoComplete="email" />
            </label>
            <label className="field ct-reveal">
              <span>Phone / WhatsApp</span>
              <input type="tel" name="phone" placeholder="+91 98765 43210" autoComplete="tel" />
            </label>
            <div className="field-row ct-reveal">
              <label className="field">
                <span>I am a</span>
                <select name="role" defaultValue="Student">
                  <option>Student</option>
                  <option>Parent</option>
                  <option>Institution / Franchise enquiry</option>
                  <option>Industry partner</option>
                </select>
              </label>
              <label className="field">
                <span>I&apos;m interested in</span>
                <select name="interest" defaultValue="6-Month Programme">
                  <option>6-Month Programme</option>
                  <option>A specific project</option>
                  <option>R&amp;D Lab</option>
                  <option>Workshop for my institution</option>
                  <option>Franchise / B2B</option>
                  <option>Free lab tour</option>
                </select>
              </label>
            </div>
            <label className="field ct-reveal">
              <span>Message (optional)</span>
              <textarea name="message" rows={3} placeholder="Tell us what you'd like to build…" />
            </label>
            <div className="ct-reveal">
              <button type="submit" className="btn btn-primary magnetic" disabled={sent}>
                {sent ? "Transmission received ✓" : "Initiate contact →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
