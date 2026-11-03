"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const EVENTS = [
  ["AI robot dog keynotes", "Live demonstrations at campus talks and placement drives"],
  ['"AI Unleashed" robotics show', "Robots performing live in front of packed auditoriums"],
  ["Campus robotics demos", "Hands-on sessions at partner colleges and universities"],
  ["School & college bootcamps", "Short, practical introductions to building robots"],
];

export default function Events({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="events" ref={root}>
      <div className="container ev-grid">
        <div>
          <span className="section-tag rv">[13] Workshops &amp; Events</span>
          <h2 className="h2 rv">
            Robotics on stage, on campus, <span className="accent">in your school.</span>
          </h2>
          <p className="muted ev-lead rv">
            We bring live robotics to students across North India through keynotes, demonstrations and hands-on
            workshops. Schools, colleges and universities can book a robotics workshop or bootcamp that gives students
            their first real experience of sensors, microcontrollers and intelligent machines.
          </p>
          <a
            href="#contact"
            className="btn btn-primary rv"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("#contact");
            }}
          >
            Book a workshop <span aria-hidden>→</span>
          </a>
        </div>
        <ul className="ev-list">
          {EVENTS.map(([t, d]) => (
            <li key={t} className="panel rv">
              <span className="pulse" aria-hidden="true" />
              <div>
                <b>{t}</b>
                <span className="muted">{d}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
