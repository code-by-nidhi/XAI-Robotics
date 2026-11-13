"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/reveal";
import type { FaqItem } from "@/lib/cms";
import { useGoClick, useServiceForm } from "../Shell";
import { Empty } from "./Cards";

/** `service: true` opens the "Request a service" pop-up instead of following a link. */
export type Action = { label: string; href?: string; ghost?: boolean; service?: boolean };

export function ActionLinks({ actions }: { actions: Action[] }) {
  const goClick = useGoClick();
  const openServiceForm = useServiceForm();
  return (
    <div className="hm-actions">
      {actions.map((a) =>
        a.service ? (
          <button
            key="service"
            type="button"
            onClick={openServiceForm}
            className={`btn ${a.ghost ? "btn-ghost" : "btn-primary"}`}
          >
            {a.ghost && <span className="btn-dot" />} {a.label} {!a.ghost && <span aria-hidden>→</span>}
          </button>
        ) : a.ghost ? (
          <a key={a.href} href={a.href} onClick={goClick(a.href ?? "/")} className="btn btn-ghost">
            <span className="btn-dot" /> {a.label}
          </a>
        ) : (
          <a key={a.href} href={a.href} onClick={goClick(a.href ?? "/")} className="btn btn-primary">
            {a.label} <span aria-hidden>→</span>
          </a>
        ),
      )}
    </div>
  );
}

/** Top of every inner page: eyebrow, big centred title, lede, actions, optional stat row. */
export function PageHero({
  eyebrow,
  title,
  lede,
  actions = [],
  stats = [],
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: Action[];
  stats?: [string, string][];
  children?: React.ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".pg-hero-title > span", { yPercent: 110, duration: 1.3 }, 0.05)
        .from(".pg-fade", { opacity: 0, y: 24, duration: 1, stagger: 0.08 }, 0.35);
    },
    { scope: root },
  );

  return (
    <section className="pg-hero" id="top" ref={root}>
      <div className="container pg-hero-inner">
        <p className="eyebrow pg-fade">
          <span className="pulse" /> {eyebrow}
        </p>
        <h1 className="pg-hero-title">
          <span>{title}</span>
        </h1>
        {lede && <p className="pg-hero-lede pg-fade">{lede}</p>}
        {actions.length > 0 && (
          <div className="pg-fade">
            <ActionLinks actions={actions} />
          </div>
        )}
        {stats.length > 0 && (
          <dl className="pg-hero-stats pg-fade">
            {stats.map(([n, l]) => (
              <div key={l}>
                <dt>{n}</dt>
                <dd className="mono muted">{l}</dd>
              </div>
            ))}
          </dl>
        )}
        {children}
      </div>
    </section>
  );
}

/** A section with the centred heading used across the site, revealing its `.rv` children. */
export function Section({
  id,
  tag,
  title,
  lede,
  children,
  className = "",
}: {
  id?: string;
  tag?: string;
  title?: string;
  lede?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section className={`section hm ${className}`} id={id} ref={root}>
      <div className="container">
        {(tag || title) && (
          <div className="hm-center">
            {tag && <span className="section-tag rv">{tag}</span>}
            {title && <h2 className="h2 rv">{title}</h2>}
            {lede && <p className="muted rv">{lede}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** FAQ accordion with a "Have more questions?" panel beside it. */
export function FaqBlock({ items, title = "FAQs", lede }: { items: FaqItem[]; title?: string; lede?: string }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const goClick = useGoClick();

  return (
    <section className="section hm" id="faq" ref={root}>
      <div className="container hm-faq">
        <div className="hm-faq-head">
          <span className="section-tag rv">Questions</span>
          <h2 className="h2 rv">{title}</h2>
          {lede && <p className="muted rv">{lede}</p>}
          <div className="pg-ask rv">
            <h3>Have more questions?</h3>
            <p className="muted">Our team is happy to walk you through the programme, workshops or a lab setup.</p>
            <a href="/contact" onClick={goClick("/contact")} className="btn btn-primary">
              Contact us <span aria-hidden>→</span>
            </a>
          </div>
        </div>
        {items.length > 0 ? (
          <div className="faq-list">
            {items.map(({ question, answer }) => (
              <details key={question} className="panel rv">
                <summary>{question}</summary>
                <p className="muted faq-answer">{answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <Empty what="FAQs" />
        )}
      </div>
    </section>
  );
}

/** Full-width call to action panel. */
export function CtaBand({
  title = "Discover the new era of robotics",
  lede = "Transforming curiosity into capability, learning into innovation and ideas into intelligent robotic solutions.",
}: {
  title?: string;
  lede?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section className="hm-band" ref={root}>
      <div className="container">
        <div className="hm-band-inner rv">
          <h2 className="h2">{title}</h2>
          <p className="muted">{lede}</p>
          <ActionLinks
            actions={[
              { label: "Request a Service", service: true },
              { label: "Our services", href: "/services", ghost: true },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/** Sanitised rich text from the CMS. */
export function Prose({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
