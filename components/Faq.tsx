"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { FaqItem } from "@/lib/cms";

/** Questions come from the CMS (FAQ), falling back to the shipped list in lib/cms.ts. */
export default function Faq({ items }: { items: FaqItem[] }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="faq" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">Questions</span>
          <h2 className="h2 rv">
            Frequently asked <span className="accent">questions.</span>
          </h2>
        </div>
        <div className="faq-list">
          {items.map(({ question, answer }) => (
            <details key={question} className="panel rv">
              <summary>{question}</summary>
              <p className="muted faq-answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
