"use client";

import type { FaqItem, SiteSettings, Testimonial } from "@/lib/cms";
import { useRef } from "react";
import { useDraw } from "../home/useDraw";
import { useReveal } from "@/lib/reveal";
import { Drone, Humanoid, Manipulator, Quadruped } from "../RobotArt";
import HomeTestimonials from "../home/HomeTestimonials";
import HomeClosing from "../home/HomeClosing";
import { CtaBand, FaqBlock, PageHero, Section } from "../ui/Blocks";

const SERVICES = [
  {
    art: <Humanoid />,
    t: "Robotics Programme",
    d: "Six months on microcontrollers, sensors, C/C++ and Python, PID control, ROS 2, SolidWorks and OpenCV — then a robot you build and keep.",
    points: ["Phase 01 · Foundation", "Phase 02 · Build", "Phase 03 · R&D (optional)"],
  },
  {
    art: <Manipulator />,
    t: "R&D Incubation",
    d: "Bring your own idea. We issue components from our lab and mentor you from prototype to presentable research.",
    points: ["Lab-issued components", "Engineer mentorship", "Patent and innovation guidance"],
  },
  {
    art: <Quadruped />,
    t: "School & College Workshops",
    d: "Short, practical bootcamps that take students from zero to a moving robot in days, not months.",
    points: ["1–5 day formats", "All kits provided", "On-campus or in our lab"],
  },
  {
    art: <Drone />,
    t: "Robot Shows & Events",
    d: "Live demonstrations, keynotes and robotics shows for campuses, placement drives and festivals.",
    points: ["AI robot dog demos", "Stage shows", "Interactive booths"],
  },
  {
    art: <Manipulator />,
    t: "Lab Setup & Franchise",
    d: "A complete robotics lab — equipment, curriculum, trainer onboarding and branding — for schools and partners.",
    points: ["Turnkey lab design", "Curriculum licence", "Trainer certification"],
  },
  {
    art: <Humanoid />,
    t: "Custom Robot Builds",
    d: "Prototypes and demonstrators for institutions and companies, designed and built by our engineering team.",
    points: ["Concept to prototype", "Embedded + mechanical", "Documentation included"],
  },
];

const STEPS = [
  ["01", "Concept", "Understand the principle behind the task."],
  ["02", "Wire", "Build the circuit on the bench."],
  ["03", "Code", "Program the microcontroller."],
  ["04", "Test", "Measure real sensor data."],
  ["05", "Debug", "Find and fix what fails."],
  ["06", "Document", "Log results in the build journal."],
];

function ServiceGrid() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useDraw(root);
  return (
    <section className="section hm" id="services" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">What we offer</span>
          <h2 className="h2 rv">Services built around real hardware</h2>
        </div>
        <div className="hm-cards">
          {SERVICES.map((s) => (
            <article key={s.t} className="hm-card rv">
              <div className="hm-card-media" aria-hidden="true">
                {s.art}
              </div>
              <h3>{s.t}</h3>
              <p className="muted">{s.d}</p>
              <ul className="pg-points">
                {s.points.map((p) => (
                  <li key={p} className="mono">
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage({
  site,
  faqs,
  testimonials,
}: {
  site: SiteSettings;
  faqs: FaqItem[];
  testimonials: Testimonial[];
}) {
  return (
    <main>
      <PageHero
        eyebrow="Services"
        title="What we do"
        lede="Robotics education, practical engineering projects, research and development, prototype exploration and institutional collaborations — connecting Artificial Intelligence with hands-on engineering."
        actions={[
          { label: "Request a Service", service: true },
          { label: "See case studies", href: "/case-studies", ghost: true },
        ]}
      />

      <ServiceGrid />

      <Section
        id="process"
        tag="How we work"
        title="The build loop"
        lede="Every module, workshop and project runs on the same six steps real robotics teams use."
      >
        <ol className="pg-steps">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="rv">
              <span className="mono muted">{n}</span>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand title="Ready to build something real?" />

      <HomeTestimonials items={testimonials} />

      <FaqBlock items={faqs} lede="What people ask before joining a programme or booking a workshop." />

      <HomeClosing social={site.social} />
    </main>
  );
}
