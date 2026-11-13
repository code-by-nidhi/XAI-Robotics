"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { FaqItem, SiteSettings, Testimonial } from "@/lib/cms";
import { useDraw } from "../home/useDraw";
import { Humanoid, Manipulator } from "../RobotArt";
import ChiChi from "../ChiChi";
import HomeTestimonials from "../home/HomeTestimonials";
import HomeClosing from "../home/HomeClosing";
import { FaqBlock, PageHero, Section } from "../ui/Blocks";

const VALUES = [
  ["Curiosity", "Every build starts with asking how something really works."],
  ["Hands-on", "Theory is finished at the bench, on real hardware."],
  ["Safety", "Supervised soldering, batteries and tools — always."],
  ["Rigor", "Measure, log and prove it before calling it done."],
  ["Collaboration", "Teams that review, debug and ship together."],
  ["Iteration", "Fail fast, fix faster, document everything."],
  ["Openness", "Open-source tools and shared knowledge by default."],
  ["Mentorship", "Engineers who guide, not just lecture."],
  ["Impact", "Robots that solve problems people actually have."],
];

/** Gourav Gupta is real; the other members are DUMMY — replace them with the real team before launch. */
const TEAM = [
  ["Gourav Gupta", "Founder & Visionary"],
  ["Meera Iyer", "Head of Curriculum"],
  ["Rohan Gill", "Lead Robotics Engineer"],
  ["Sana Qureshi", "Embedded Systems Mentor"],
  ["Kabir Arora", "Computer Vision Mentor"],
  ["Nisha Verma", "Partnerships & Institutions"],
];

const TECH = [
  "Artificial Intelligence",
  "Embedded Systems",
  "Mechatronics",
  "Computer Vision",
  "ROS 2",
  "CAD Design",
  "Intelligent Control",
];

const SECTORS = ["Manufacturing", "Agriculture", "Healthcare", "Education", "Logistics", "Everyday life"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

/** 1. Our journey — Chi Chi, August 2025. */
function Journey() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useDraw(root);
  return (
    <section className="section hm" id="journey" ref={root}>
      <div className="container hm-split">
        <div className="hm-media pg-chichi-media rv">
          <ChiChi />
          <span className="hm-media-tag mono">
            <span className="pulse" /> Chi Chi · AI robotic dog
          </span>
        </div>
        <div className="hm-split-copy">
          <span className="section-tag rv">Our journey — August 2025</span>
          <h2 className="h2 rv">A vision took shape. An innovation came to life.</h2>
          <p className="muted rv">
            Established in August 2025, XAI Robotics began its journey with the introduction of Chi Chi, a new-age AI
            robotic dog that became the face of our vision for intelligent robotics and human–robot interaction.
          </p>
          <p className="muted rv">
            Chi Chi marked the beginning of an ambitious initiative to bring robotics closer to students, educators,
            innovators and industries. More than a technological demonstration, Chi Chi represented our commitment to
            making advanced robotics engaging, accessible and relevant to the next generation.
          </p>
          <p className="muted rv">
            Under the entrepreneurial vision of Mr. Gourav Gupta, XAI Robotics emerged within the techcadd ecosystem to
            connect Artificial Intelligence with real-world engineering, practical robotics education and
            research-driven innovation. What began with Chi Chi has evolved into a broader vision encompassing
            intelligent robotic systems, embedded technologies, automation, computer vision, robotics training and
            prototype development.
          </p>
          <p className="pg-pull rv">
            Our journey began with Chi Chi. Our ambition extends to the future of intelligent machines.
          </p>
        </div>
      </div>
    </section>
  );
}

/** 2. About us. */
function Who() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useDraw(root);
  return (
    <section className="section hm" id="who" ref={root}>
      <div className="container hm-split">
        <div className="hm-split-copy">
          <span className="section-tag rv">About us</span>
          <h2 className="h2 rv">Where Artificial Intelligence meets the physical world</h2>
          <p className="muted rv">
            XAI Robotics is an emerging robotics and AI-focused initiative dedicated to advancing practical robotics
            education, intelligent automation, hands-on engineering and research-oriented innovation in India.
          </p>
          <p className="muted rv">
            Today our focus extends to robotics education, practical engineering projects, research and development,
            prototype exploration, institutional collaborations and opportunities for innovation. Through our hands-on
            programmes, students and aspiring engineers progress from fundamental electronics and programming to
            designing, building, testing and refining functional robotic systems.
          </p>
          <p className="muted rv">
            We aim to connect India&apos;s emerging talent with the technologies shaping the global robotics landscape —
            autonomous systems, intelligent manufacturing, collaborative robotics, edge AI and advanced automation.
          </p>
          <ul className="pg-chips rv">
            {TECH.map((t) => (
              <li key={t} className="mono">
                {t}
              </li>
            ))}
          </ul>
          <p className="pg-pull rv">
            The future of technology is not just intelligent — it is interactive, autonomous and built through
            innovation.
          </p>
        </div>
        <div className="pg-duo rv" aria-hidden="true">
          <div className="hm-media">
            <Humanoid />
          </div>
          <div className="hm-media">
            <Manipulator />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 3 & 4. Mission and vision, side by side. */
function MissionVision() {
  return (
    <Section id="mission" tag="Mission & vision" title="Why we exist">
      <div className="pg-mv">
        <article className="pg-mv-card rv">
          <span className="mono muted">Our mission</span>
          <h3>Empowering minds. Engineering machines. Advancing India.</h3>
          <p className="muted">
            To accelerate robotics awareness, education and innovation in India by connecting Artificial Intelligence
            with practical engineering, hands-on experimentation and real-world applications.
          </p>
          <p className="muted">
            Through structured learning, technical mentorship, robotic prototyping, robotics laboratories and
            institutional partnerships, we bridge the gap between theoretical knowledge and industry-oriented robotics
            capabilities — nurturing future-ready talent for India&apos;s technological progress and the global robotics
            ecosystem.
          </p>
          <p className="pg-pull">
            Transforming curiosity into capability, learning into innovation and ideas into intelligent robotic
            solutions.
          </p>
        </article>
        <article className="pg-mv-card rv">
          <span className="mono muted">Our vision</span>
          <h3>An intelligent India in a robotics-driven world</h3>
          <p className="muted">
            To help position India as an active contributor to the global robotics revolution — advancing robotics
            education, encouraging indigenous innovation and supporting intelligent, practical and responsible robotic
            technologies that work alongside people.
          </p>
          <p className="muted">
            Aligned with Make in India, Atmanirbhar Bharat and Viksit Bharat 2047, we aim to develop a generation of
            Indian innovators who do not merely adopt the robotics technologies of tomorrow, but possess the knowledge,
            confidence and creativity to help shape them.
          </p>
          <p className="pg-pull">
            An India that learns robotics, builds robotics and contributes to the world&apos;s intelligent future.
          </p>
        </article>
      </div>
    </Section>
  );
}

/** 5. Connecting XAI Robotics with India's and the world's robotics future. */
function India() {
  return (
    <Section
      id="india"
      tag="India & the world"
      title="Rooted in India. Inspired by global innovation."
      lede="Robotics is transforming the way the world manufactures, moves, learns and innovates — and India is creating new opportunities in robotics education, engineering research, automation and indigenous technology."
    >
      <div className="pg-india">
        <p className="muted rv">
          At XAI Robotics, we aspire to connect this global technological evolution with India&apos;s growing potential.
          Through hands-on education, robotics laboratories, research-oriented projects and collaboration with academic
          institutions, we aim to encourage the practical skills and innovative thinking required for the next
          generation of intelligent machines.
        </p>
        <p className="muted rv">
          Our focus is not simply to introduce students to existing robotics technologies, but to help them
          understand, build, experiment and innovate — contributing to a stronger robotics ecosystem in India.
        </p>
        <ul className="pg-chips pg-chips-center rv">
          {SECTORS.map((t) => (
            <li key={t} className="mono">
              {t}
            </li>
          ))}
        </ul>
        <p className="pg-pull rv">
          From India to the world — a future powered by intelligent engineering, responsible innovation and human
          ingenuity.
        </p>
      </div>
    </Section>
  );
}

function Labs({ general }: { general: SiteSettings["general"] }) {
  const lines = [general.address, general.city].filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <Section id="visit" tag="Visit us" title="Visit our labs" lede="See the robots in person and meet the mentors.">
      <div className="pg-labs">
        {lines.map((line) => {
          const [name, place] = line.includes("—") ? line.split("—").map((s) => s.trim()) : ["Lab", line];
          return (
            <article key={line} className="pg-lab rv">
              <span className="mono muted">{name}</span>
              <h3>{place}</h3>
              {general.hours && <p className="muted">{general.hours}</p>}
              <a
                className="pg-more mono"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps ↗
              </a>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

export default function AboutPage({
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
        eyebrow="About us · Est. August 2025"
        title="About XAI Robotics"
        lede="Engineering intelligence. Inspiring innovation. Shaping tomorrow. Robotics, Artificial Intelligence, research and innovation — rooted in India, for a robotics-driven world."
        actions={[
          { label: "Request a Service", service: true },
          { label: "Our journey", href: "#journey", ghost: true },
        ]}
        stats={[
          ["Aug 2025", "Established"],
          ["Chi Chi", "Our AI robotic dog"],
          ["techcadd", "Ecosystem"],
        ]}
      />

      <Journey />

      <Who />

      <MissionVision />

      <Section id="values" tag="Our values" title="What drives every build">
        <ul className="pg-values">
          {VALUES.map(([v, d]) => (
            <li key={v} className="rv">
              <h3>{v}</h3>
              <p className="muted">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="team"
        tag="Our team"
        title="Meet the team behind XAI Robotics"
        lede="Engineers, educators and makers bringing robotics closer to students, educators, innovators and industries."
      >
        <div className="pg-team">
          {TEAM.map(([name, role]) => (
            <article key={name} className="pg-member rv">
              <span className="pg-member-avatar" aria-hidden="true">
                {initials(name)}
              </span>
              <h3>{name}</h3>
              <p className="mono muted">{role}</p>
            </article>
          ))}
        </div>
      </Section>

      <India />

      <Labs general={site.general} />

      <HomeTestimonials items={testimonials} />

      <FaqBlock items={faqs} lede="Answers to what students, parents and partners ask us most." />

      <HomeClosing social={site.social} />
    </main>
  );
}
