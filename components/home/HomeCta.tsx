"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useServiceForm } from "../Shell";

export default function HomeCta({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  useReveal(root);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <section className="hm-band" ref={root}>
      <div className="container">
        <div className="hm-band-inner rv">
          <h2 className="h2">Empowering minds. Engineering machines.</h2>
          <p className="muted">
            Our mission is to transform curiosity into capability, learning into innovation and ideas into intelligent
            robotic solutions.
          </p>
          <div className="hm-actions">
            <button type="button" className="btn btn-primary" onClick={openServiceForm}>
              Request a Service <span aria-hidden>→</span>
            </button>
            <a href="/about" className="btn btn-ghost" onClick={(e) => go(e, "/about")}>
              <span className="btn-dot" /> Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
