"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useServiceForm } from "../Shell";

export default function HomeFinalCta({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useReveal(root);

  return (
    <section className="hm-band" ref={root} id="final-cta">
      <div className="container">
        <div className="hm-band-inner rv">
          <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
            Get Started · Let&apos;s Collaborate
          </span>
          <h2 className="h2" style={{ marginTop: "8px" }}>The Future Is Being Engineered Today.</h2>
          <p className="mono" style={{ fontSize: "14px", color: "var(--accent)", letterSpacing: "0.04em" }}>
            Let&apos;s Build Something Intelligent Together.
          </p>
          <p className="muted" style={{ maxWidth: 760, fontSize: "16px", lineHeight: "1.7" }}>
            Whether you represent an educational institution, a business, a technology organisation or simply have an interest in robotics, X AI Robotics invites you to explore the possibilities of intelligent machines. Discover our robotics services, experience Chi Chi, organise a robotics demonstration, establish a robotics laboratory or discuss an innovative project with our team.
          </p>
          <div className="sec-quote-box" style={{ maxWidth: 680, margin: "12px 0 20px" }}>
            &ldquo;The next chapter of robotics begins with an idea. Let&apos;s engineer it together.&rdquo;
          </div>
          <div className="hm-actions">
            <a
              href="/services"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/services");
              }}
            >
              Explore Robotics <span aria-hidden>→</span>
            </a>
            <button type="button" className="btn btn-ghost" onClick={openServiceForm}>
              <span className="btn-dot" /> Partner With Us
            </button>
            <button type="button" className="btn btn-ghost" onClick={openServiceForm}>
              <span className="btn-dot" /> Book a Demonstration
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
