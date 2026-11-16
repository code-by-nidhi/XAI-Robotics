"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import { useGsapTilt, useGsapFloating } from "@/lib/gsapEffects";
import ChiChi from "../ChiChi";

export default function HomeBeginning({ onNavigate }: { onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useGsapTilt(root, ".sec-card");
  useGsapFloating(root, ".hm-media-tag");

  return (
    <section className="section hm" id="beginning" ref={root}>
      <div className="container hm-split hm-split-sticky">
        <div className="hm-sticky-wrap">
          <div className="hm-media pg-chichi-media">
            <ChiChi />
            <span className="hm-media-tag mono gsap-float">
              <span className="pulse" /> Chi Chi · AI Robot Dog Prototype
            </span>
          </div>
        </div>
        <div className="hm-split-copy hm-justified-text">
          <span className="section-tag rv">Our Beginning — August 2025</span>
          <h2 className="h2 rv" style={{ textAlign: "left" }}>The Beginning of a New Robotics Journey</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em", textAlign: "left" }}>
            August 2025 — When Chi Chi Introduced Us to a New World of Robotics
          </p>

          <p className="muted rv">
            Established in <strong>August 2025</strong>, X AI Robotics emerged with the introduction of <strong>Chi Chi</strong>, our new-age AI robot dog prototype, marking the beginning of an ambitious journey into the world of robotics, intelligent machines and emerging automation technologies.
          </p>
          <p className="muted rv">
            We believe the future belongs to organisations that can connect artificial intelligence with physical intelligence. From autonomous robotic systems and embedded technologies to computer vision, intelligent automation and advanced robotics research, we aim to make robotics more accessible, practical and relevant to the world around us.
          </p>
          <p className="muted rv">
            X AI Robotics is a robotics-focused technology and service venture operating within the <strong>techcadd</strong> ecosystem. We bring together robotics demonstrations, hands-on engineering programmes, institutional robotics solutions, laboratory development, technical mentorship and research-oriented prototyping.
          </p>
          <p className="muted rv">
            Our objective is to create meaningful connections between technology, education, industry and innovation—helping individuals and institutions understand, experience and participate in the evolving world of robotics.
          </p>

          <div className="sec-card rv" style={{ margin: "20px 0", padding: "20px 24px" }}>
            <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.12em" }}>
              The Defining Step
            </span>
            <p className="sec-card-text" style={{ fontSize: "14.5px", marginTop: "8px" }}>
              Every technological journey begins with an idea. For X AI Robotics, that journey took a defining step in August 2025 with the introduction of Chi Chi. Chi Chi represented more than a robotic demonstration—it became an opportunity to bring emerging robotics technology closer to students, educators, institutions and technology enthusiasts.
            </p>
          </div>

          <p className="muted rv">
            Through its dynamic movements, responsive interactions and advanced robotic capabilities, Chi Chi helped demonstrate how mechanical engineering, electronics, embedded systems, sensors, programming and artificial intelligence can come together in a physical machine.
          </p>
          <p className="muted rv">
            The introduction of Chi Chi became the starting point for a larger vision: to develop an ecosystem where people do not simply observe technological advancement but gain opportunities to understand, experiment with and engage in robotics.
          </p>
          <p className="muted rv">
            What began with the excitement of a robotic dog evolved into a broader ambition encompassing robotics education, institutional partnerships, hands-on workshops, laboratory development, prototype exploration and emerging technology applications. Today, X AI Robotics builds upon that beginning with a forward-looking approach to robotics and intelligent systems.
          </p>

          <div className="sec-quote-box rv" style={{ marginTop: "16px" }}>
            Chi Chi is the symbol of our beginning. Innovation is the direction of our journey.
          </div>

          <div className="rv" style={{ marginTop: "24px" }}>
            <a
              href="/about-us#chichi"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/about-us#chichi");
              }}
            >
              <span className="btn-dot" /> The story of Chi Chi <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
