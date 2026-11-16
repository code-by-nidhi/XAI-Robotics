"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { FaqItem, SiteSettings, Testimonial } from "@/lib/cms";
import ChiChi from "../ChiChi";
import HomeTestimonials from "../home/HomeTestimonials";
import HomeClosing from "../home/HomeClosing";
import { FaqBlock, PageHero, Section } from "../ui/Blocks";
import { useGoClick, useServiceForm } from "../Shell";

/* ==========================================================================
   Section 1. About X AI Robotics — Our Story
   ========================================================================== */
function AboutStory() {
  return (
    <Section id="story" tag="Our Story" title="About X AI Robotics">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "13px", letterSpacing: "0.12em" }}>
          From the Introduction of Chi Chi to a Bigger Vision for Robotics · Established in August 2025
        </p>
      </div>

      <div className="muted rv" style={{ maxWidth: 860, margin: "24px auto 0", fontSize: "16px", lineHeight: "1.8" }}>
        <p style={{ marginBottom: "16px" }}>
          <strong>X AI Robotics</strong> was established in <strong>August 2025</strong>, beginning its journey with the introduction of Chi Chi, a new-age AI robot dog prototype that represented an exciting entry into the evolving world of robotics.
        </p>
        <p style={{ marginBottom: "16px" }}>
          The introduction of Chi Chi was an important milestone in bringing modern robotic technology into a practical and engaging environment. As a quadruped robotic platform, Chi Chi offered an opportunity to demonstrate the relationship between mechanical movement, electronics, sensors, embedded control, programming and intelligent robotic behaviour.
        </p>
        <p style={{ marginBottom: "16px" }}>
          It also created a starting point for a broader conversation about the role robotics can play in education, industry, research and everyday life.
        </p>
        <p style={{ marginBottom: "16px" }}>
          The vision behind X AI Robotics extends beyond the introduction of a single robotic platform. It is about building a service-oriented robotics ecosystem that connects technical knowledge, practical engineering, institutional engagement, innovation and real-world application.
        </p>
        <p style={{ marginBottom: "16px" }}>
          We see robotics as one of the defining technological disciplines of the coming decades. Its evolution will influence manufacturing, transportation, agriculture, healthcare, education, logistics, infrastructure and many other areas.
        </p>
        <p style={{ marginBottom: "16px" }}>
          Our purpose is to help people and organisations understand this transformation and participate in it through meaningful robotics services and practical engagement.
        </p>
        <p>
          As an initiative of the <strong>techcadd</strong> ecosystem, X AI Robotics brings together the wider strengths of technology education and emerging technology exploration.
        </p>
      </div>

      <div className="sec-callout-banner rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
        <p className="muted" style={{ fontSize: "15px" }}>Our approach is founded on a simple belief:</p>
        <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)" }}>
          &ldquo;The future of robotics should not remain distant or inaccessible. It should be experienced, understood, explored and developed by people everywhere.&rdquo;
        </p>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 2. Our Origin — The Story of Chi Chi
   ========================================================================== */
const CHI_CHI_DISCIPLINES = [
  "Mechanical structures and articulated joints",
  "Electric motors and actuator systems",
  "Embedded control electronics",
  "Motion planning and balance control",
  "Inertial measurement and environmental sensors",
  "Wireless communication",
  "Perception and computer vision",
  "Robotic software and control algorithms",
];

function OriginChiChi() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section hm" id="chichi" ref={root}>
      <div className="container hm-split hm-split-sticky">
        <div className="hm-sticky-wrap">
          <div className="hm-media pg-chichi-media">
            <ChiChi />
            <span className="hm-media-tag mono">
              <span className="pulse" /> Chi Chi · The Prototype That Started Our Journey
            </span>
          </div>
        </div>
        <div className="hm-split-copy hm-justified-text">
          <span className="section-tag rv">Our Origin</span>
          <h2 className="h2 rv" style={{ textAlign: "left" }}>The Story of Chi Chi</h2>
          <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em", textAlign: "left" }}>
            The Prototype That Started Our Robotics Journey
          </p>
          <p className="muted rv">
            Every new venture has a defining moment that gives its vision a physical identity. For X AI Robotics, that moment came in <strong>August 2025</strong> with the introduction of <strong>Chi Chi</strong>, our new-age AI robot dog prototype.
          </p>
          <p className="muted rv">
            Chi Chi became the face of our initial robotics journey, representing the growing possibilities of intelligent machines and their ability to interact with physical environments. Quadruped robots are an important category of modern mobile robotics. Unlike conventional wheeled robots, their legged locomotion allows them to explore movement across different types of surfaces and terrain, subject to their mechanical design and operating conditions.
          </p>

          <div className="rv" style={{ margin: "16px 0" }}>
            <h3 className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.12em", marginBottom: "10px" }}>
              Modern quadruped platforms combine multiple engineering disciplines:
            </h3>
            <ul className="sec-list-disc">
              {CHI_CHI_DISCIPLINES.map((d, i) => (
                <li key={i} style={{ fontSize: "13.5px" }}>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <p className="muted rv">
            Chi Chi provides an engaging way to introduce these concepts to students, institutions and audiences interested in robotics. Through live demonstrations and technology showcases, the robot dog helps make otherwise complex engineering concepts easier to appreciate.
          </p>
          <p className="muted rv">
            Its introduction also encouraged us to think beyond demonstrations. We began shaping a broader service vision around robotics training, institutional laboratory development, technical workshops, prototype exploration and robotics-related collaborations.
          </p>
          <p className="muted rv">
            Chi Chi is therefore more than a demonstration platform. It represents the starting point of our commitment to making robotics a more visible, understandable and accessible field. We see this as the first step in a much larger journey towards intelligent robotic systems and practical innovation.
          </p>
          <div className="sec-quote-box rv" style={{ marginTop: "16px" }}>
            Chi Chi introduced the possibilities. X AI Robotics is committed to exploring what comes next.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Section 3. Our identity and philosophy
   ========================================================================== */
const PHILOSOPHY_PRINCIPLES = [
  {
    name: "Understand the Technology",
    desc: "We believe practical innovation begins with a strong understanding of how systems work.",
  },
  {
    name: "Build with Purpose",
    desc: "Every robotics project should have a defined objective, technical scope and intended application.",
  },
  {
    name: "Experiment Responsibly",
    desc: "Engineering development requires testing, validation, safety and continuous improvement.",
  },
  {
    name: "Collaborate Across Disciplines",
    desc: "The most meaningful robotics solutions often emerge when mechanical, electrical, software and AI capabilities work together.",
  },
  {
    name: "Create Practical Value",
    desc: "Our focus is on connecting technological possibilities with real learning, operational and societal needs.",
  },
];

function IdentityPhilosophy() {
  return (
    <Section id="philosophy" tag="Identity & Philosophy" title="Who We Are">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          A Robotics-Focused Technology and Service Venture
        </p>
        <div className="muted rv" style={{ maxWidth: 860, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
          <p style={{ marginBottom: "14px" }}>
            X AI Robotics is an initiative dedicated to exploring, demonstrating and advancing the practical possibilities of robotics and intelligent machines. We operate at the intersection of robotics engineering, technology services, education, research-oriented prototyping and institutional collaboration.
          </p>
          <p style={{ marginBottom: "14px" }}>
            Our identity is built around the understanding that robotics is not a single technology. It is a combination of mechanical engineering, electrical and electronics systems, embedded programming, computer science, artificial intelligence, control theory and human-machine interaction.
          </p>
          <p style={{ marginBottom: "14px" }}>
            A modern robot may require mechanical structures to create movement, sensors to understand its environment, processors to interpret information, control systems to manage motion and intelligent software to support decisions. Bringing all these elements together requires a multidisciplinary approach.
          </p>
          <p style={{ marginBottom: "14px" }}>
            Our service-oriented model aims to connect these capabilities with the requirements of different audiences:
          </p>
          <div className="sec-grid-2" style={{ textAlign: "left", margin: "20px 0" }}>
            <div className="sec-card" style={{ padding: "20px 24px" }}>
              <span className="mono muted" style={{ fontSize: "11px" }}>For Educational Institutions</span>
              <p className="sec-card-text">Robotics laboratories, faculty orientation, technical workshops and practical learning programmes.</p>
            </div>
            <div className="sec-card" style={{ padding: "20px 24px" }}>
              <span className="mono muted" style={{ fontSize: "11px" }}>For Students &amp; Aspiring Engineers</span>
              <p className="sec-card-text">Exposure to professional hardware, robotics software, practical projects and prototype development.</p>
            </div>
            <div className="sec-card" style={{ padding: "20px 24px" }}>
              <span className="mono muted" style={{ fontSize: "11px" }}>For Businesses &amp; Organisations</span>
              <p className="sec-card-text">Technology awareness, robotics demonstrations, preliminary technical consultations and exploration of suitable robotics applications.</p>
            </div>
            <div className="sec-card" style={{ padding: "20px 24px" }}>
              <span className="mono muted" style={{ fontSize: "11px" }}>For Innovators &amp; Researchers</span>
              <p className="sec-card-text">Structured support in understanding engineering requirements and developing approved prototypes.</p>
            </div>
          </div>
          <p>
            We believe that the future of robotics will require collaboration between educators, engineers, researchers, manufacturers, entrepreneurs and policymakers. X AI Robotics aims to become a meaningful participant in this ecosystem.
          </p>
        </div>
      </div>

      <div className="rv" style={{ maxWidth: 960, margin: "48px auto 0" }}>
        <h3 className="mono muted" style={{ fontSize: "12px", letterSpacing: "0.14em", marginBottom: "20px", textAlign: "center" }}>
          Our philosophy is centred on five principles:
        </h3>
        <div className="sec-grid-3">
          {PHILOSOPHY_PRINCIPLES.map((p, idx) => (
            <article key={p.name} className="sec-card">
              <span className="sec-card-num">0{idx + 1}</span>
              <h4 className="sec-card-title" style={{ fontSize: "1.05rem" }}>{p.name}</h4>
              <p className="sec-card-text">{p.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 4. Our Mission
   ========================================================================== */
const MISSIONS_ABOUT = [
  {
    num: "1",
    title: "Promote Practical Robotics and Engineering",
    desc: "Create opportunities for learners and institutions to experience robotics through practical training, hands-on projects, demonstrations and structured technical programmes.",
  },
  {
    num: "2",
    title: "Bridge Artificial Intelligence and Robotics",
    desc: "Encourage the integration of AI, machine learning, computer vision, embedded systems and robotic hardware to explore intelligent machines and emerging applications.",
  },
  {
    num: "3",
    title: "Strengthen India's Robotics Ecosystem",
    desc: "Contribute to India's growing robotics landscape by encouraging technical skills, engineering experimentation, institutional partnerships and indigenous innovation.",
  },
  {
    num: "4",
    title: "Support Institutional Robotics Development",
    desc: "Help schools, colleges, universities and educational organisations establish robotics laboratories, conduct workshops and introduce structured robotics programmes.",
  },
  {
    num: "5",
    title: "Encourage Research and Prototyping",
    desc: "Create opportunities for students, aspiring engineers and innovators to explore original concepts, develop prototypes and understand the engineering processes behind robotics.",
  },
  {
    num: "6",
    title: "Connect Technology with Industry Needs",
    desc: "Explore practical robotics applications across manufacturing, agriculture, logistics, healthcare support, education, infrastructure and other sectors where appropriate.",
  },
  {
    num: "7",
    title: "Promote Responsible Robotics",
    desc: "Encourage safety-conscious engineering, responsible AI adoption, human oversight, ethical development and practical consideration of the impact of robotic systems.",
  },
];

function AboutMission() {
  return (
    <Section id="mission" tag="Our Mission" title="Our Mission">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          To Advance Robotics Through Engineering, Innovation and Collaboration
        </p>
        <p className="muted rv" style={{ maxWidth: 840, margin: "16px auto 0", fontSize: "16px", lineHeight: "1.7" }}>
          Our mission is to make robotics more accessible, understandable and practically applicable by connecting emerging technologies with real-world learning, engineering services and innovation opportunities.
        </p>
      </div>

      <div className="sec-grid-2 rv" style={{ marginTop: "40px" }}>
        {MISSIONS_ABOUT.map((m) => (
          <article key={m.num} className="sec-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="sec-card-num">0{m.num}</span>
              <h3 className="sec-card-title" style={{ fontSize: "1.05rem" }}>{m.title}</h3>
            </div>
            <p className="sec-card-text">{m.desc}</p>
          </article>
        ))}
      </div>

      <div className="sec-callout-banner rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
        <p className="muted" style={{ fontSize: "16.5px" }}>
          &ldquo;Our mission is not simply to introduce more robots into the world. It is to help create the knowledge, skills, infrastructure and innovation ecosystem required to use robotics meaningfully.&rdquo;
        </p>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 5. Our Vision — India and the World
   ========================================================================== */
const VISION_ASPIRATIONS = [
  "Promoting practical robotics understanding and engineering exposure.",
  "Supporting the development of robotics laboratories and technical infrastructure.",
  "Encouraging collaboration between educational institutions and technology organisations.",
  "Creating opportunities for students and innovators to explore robotic systems.",
  "Supporting research-oriented prototyping and engineering experimentation.",
  "Exploring robotics applications relevant to Indian industries and communities.",
  "Building awareness of global robotics developments and emerging technologies.",
  "Encouraging responsible innovation and safety-conscious engineering.",
];

function AboutVision() {
  return (
    <Section id="vision" tag="Our Vision" title="India and the World">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Contributing to India&apos;s Robotics Revolution · Connecting with Global Innovation
        </p>
        <div className="muted rv" style={{ maxWidth: 860, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
          <p style={{ marginBottom: "14px" }}>
            We envision a future in which India becomes a significant global contributor to robotics research, engineering, innovation, development and manufacturing.
          </p>
          <p style={{ marginBottom: "14px" }}>
            Robotics is undergoing a major transformation worldwide. Traditional industrial robots are increasingly being complemented by collaborative robots, autonomous mobile platforms, quadruped robots, humanoid systems, intelligent inspection devices and AI-enabled service robots. These technologies are changing how industries operate and how people interact with machines.
          </p>
          <p>
            Our vision is to participate in this transformation by supporting practical robotics capabilities, institutional partnerships, innovation initiatives and responsible technology adoption.
          </p>
        </div>
      </div>

      {/* Global Robotics Perspective */}
      <div className="rv" style={{ maxWidth: 860, margin: "32px auto 0" }}>
        <h3 className="mono muted" style={{ fontSize: "12px", letterSpacing: "0.14em", marginBottom: "14px" }}>
          A Global Robotics Perspective
        </h3>
        <p className="muted" style={{ fontSize: "15px", lineHeight: "1.7" }}>
          Across the world, robotics is moving into increasingly diverse applications:
        </p>
        <div className="sec-grid-2" style={{ margin: "16px 0" }}>
          <div className="sec-card" style={{ padding: "18px 22px" }}>
            <span className="mono muted" style={{ fontSize: "11px" }}>Manufacturing</span>
            <p className="sec-card-text">Assembly, welding, material handling, inspection and precision operations.</p>
          </div>
          <div className="sec-card" style={{ padding: "18px 22px" }}>
            <span className="mono muted" style={{ fontSize: "11px" }}>Logistics</span>
            <p className="sec-card-text">Autonomous mobile robots supporting the movement and handling of goods.</p>
          </div>
          <div className="sec-card" style={{ padding: "18px 22px" }}>
            <span className="mono muted" style={{ fontSize: "11px" }}>Healthcare</span>
            <p className="sec-card-text">Surgical systems, rehabilitation technologies, laboratory automation and patient support.</p>
          </div>
          <div className="sec-card" style={{ padding: "18px 22px" }}>
            <span className="mono muted" style={{ fontSize: "11px" }}>Agriculture &amp; Research</span>
            <p className="sec-card-text">Field monitoring, automated operations, human-robot interaction and intelligent control.</p>
          </div>
        </div>
      </div>

      {/* India's Opportunity */}
      <div className="rv" style={{ maxWidth: 860, margin: "24px auto 0" }}>
        <h3 className="mono muted" style={{ fontSize: "12px", letterSpacing: "0.14em", marginBottom: "12px" }}>
          India&apos;s Opportunity
        </h3>
        <p className="muted" style={{ fontSize: "15px", lineHeight: "1.75" }}>
          India has a significant opportunity to strengthen its position in the global robotics landscape. The country&apos;s engineering talent, expanding manufacturing ecosystem, growing technology sector, educational institutions and entrepreneurial environment create important foundations for future robotics development. India&apos;s Draft National Strategy on Robotics, published by the Ministry of Electronics and Information Technology in 2023, highlighted the importance of research, design, development, manufacturing, entrepreneurship, domestic intellectual property and workforce development.
        </p>
      </div>

      {/* Our Aspiration */}
      <div className="rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
        <h3 className="mono muted" style={{ fontSize: "12px", letterSpacing: "0.14em", marginBottom: "16px", textAlign: "center" }}>
          Within this evolving landscape, X AI Robotics aims to contribute by:
        </h3>
        <ul className="sec-list-disc sec-card" style={{ padding: "28px 32px" }}>
          {VISION_ASPIRATIONS.map((asp, idx) => (
            <li key={idx} style={{ color: "var(--text)" }}>
              {asp}
            </li>
          ))}
        </ul>
      </div>

      {/* A Future Beyond Borders */}
      <div className="sec-callout-banner rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
        <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>A Future Beyond Borders</span>
        <p className="muted" style={{ fontSize: "15px" }}>
          Our vision is not limited to one city, one institution or one market. We want to remain connected to the wider global robotics community, learn from international engineering developments and encourage meaningful collaboration wherever opportunities arise. We believe India&apos;s future in robotics will depend not only on adopting advanced technologies but also on developing the ability to understand, adapt, engineer and create them.
        </p>
        <p style={{ fontSize: "17px", fontWeight: "600", color: "var(--text)" }}>
          X AI Robotics aspires to be part of that journey—connecting Indian innovation with the possibilities of a rapidly advancing world.
        </p>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 6. Our service philosophy
   ========================================================================== */
const SERVICE_STEPS = [
  {
    step: "01",
    title: "Discover and Understand",
    desc: "We begin by understanding the client's requirements, intended audience, technical interests and objectives.",
  },
  {
    step: "02",
    title: "Evaluate and Plan",
    desc: "We identify suitable robotics platforms, equipment, learning resources, technical approaches and implementation requirements.",
  },
  {
    step: "03",
    title: "Design and Configure",
    desc: "Where applicable, we help define laboratory layouts, project specifications, hardware configurations, workshop structures and technical workflows.",
  },
  {
    step: "04",
    title: "Implement and Demonstrate",
    desc: "We support the agreed activity through practical demonstrations, programme delivery, hardware setup, training or prototyping guidance.",
  },
  {
    step: "05",
    title: "Test and Validate",
    desc: "We emphasise practical testing, safe operation, troubleshooting and evaluation against the agreed objectives.",
  },
  {
    step: "06",
    title: "Support and Improve",
    desc: "We encourage ongoing technical engagement, learning and improvement through agreed support arrangements.",
  },
];

function ServicePhilosophy() {
  return (
    <Section id="service-philosophy" tag="Service Philosophy" title="Our Approach to Robotics Services">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          From Concept to Practical Engagement
        </p>
        <p className="muted rv" style={{ maxWidth: 820, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
          We believe every robotics engagement should begin with an understanding of the intended purpose. A school looking to introduce robotics to students has different requirements from a university developing a robotics laboratory. A business exploring automation has different objectives from an engineering student developing a prototype. Our service approach is designed around these differences.
        </p>
      </div>

      <div className="sec-grid-3 rv" style={{ marginTop: "44px" }}>
        {SERVICE_STEPS.map((s) => (
          <article key={s.step} className="sec-card">
            <span className="sec-card-num">{s.step}</span>
            <h3 className="sec-card-title">{s.title}</h3>
            <p className="sec-card-text">{s.desc}</p>
          </article>
        ))}
      </div>

      <div className="sec-quote-box rv" style={{ maxWidth: 860, margin: "36px auto 0", textAlign: "center" }}>
        Our objective is to create a service experience that is structured, transparent and focused on practical outcomes.
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 7. Our service portfolio
   ========================================================================== */
const PORTFOLIO_SERVICES = [
  {
    title: "Robotics Demonstrations and Exhibitions",
    desc: "We provide robotics demonstration experiences for educational events, institutional gatherings, technology exhibitions, innovation summits and corporate showcases. Our AI robot dog, Chi Chi, can serve as an engaging demonstration platform for introducing modern quadruped robotics.",
  },
  {
    title: "Robotics Workshops and Bootcamps",
    desc: "We organise structured sessions that introduce participants to electronics, embedded systems, robotic movement, sensors, actuators, programming and basic automation concepts.",
  },
  {
    title: "Robotics Laboratory Development",
    desc: "We support institutions in planning and establishing robotics labs, including equipment selection, component recommendations, layout planning, curriculum alignment and technical orientation.",
  },
  {
    title: "Robotics Education and Training",
    desc: "Our flagship six-month programme introduces participants to the fundamentals of robotics and progresses towards practical engineering projects and optional R&D activities.",
  },
  {
    title: "Custom Robotics Prototyping Support",
    desc: "We help explore selected robotics concepts through project planning, component selection, engineering guidance, hardware integration and prototype experimentation, depending on feasibility and scope.",
  },
  {
    title: "Research and Innovation Support",
    desc: "We encourage approved projects that explore emerging applications in assistive robotics, agricultural technology, autonomous movement, edge AI and industrial inspection.",
  },
  {
    title: "Institutional Partnerships",
    desc: "We work towards partnerships with schools, colleges, universities and educational organisations through robotics programmes, workshops, turnkey labs and trainer development.",
  },
  {
    title: "Robotics Technology Consultation",
    desc: "We provide preliminary technical guidance for organisations exploring robotics platforms, educational infrastructure, project feasibility and technology adoption.",
  },
];

function ServicePortfolio() {
  return (
    <Section id="portfolio-overview" tag="Service Portfolio" title="What We Do">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Robotics Services Designed Around Different Needs
        </p>
      </div>

      <div className="sec-grid-2 rv" style={{ marginTop: "40px" }}>
        {PORTFOLIO_SERVICES.map((s, idx) => (
          <article key={s.title} className="sec-card">
            <span className="sec-card-num">0{idx + 1}</span>
            <h3 className="sec-card-title">{s.title}</h3>
            <p className="sec-card-text">{s.desc}</p>
          </article>
        ))}
      </div>

      <div className="sec-quote-box rv" style={{ maxWidth: 860, margin: "36px auto 0", textAlign: "center" }}>
        Each engagement is evaluated according to technical requirements, available resources, safety considerations, delivery capacity and mutually agreed terms.
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 8. Our technical foundation
   ========================================================================== */
const TECHNICAL_FOUNDATION = [
  {
    title: "Mechanical Engineering",
    desc: "Robot structures, chassis design, mechanical assemblies, movement mechanisms and component integration.",
  },
  {
    title: "Electronics Engineering",
    desc: "Circuits, power management, motor drivers, sensors, microcontrollers and electronic interfaces.",
  },
  {
    title: "Embedded Systems",
    desc: "Firmware, microcontroller programming, real-time processing and communication between hardware components.",
  },
  {
    title: "Robotics Software",
    desc: "ROS 2, robot models, system architecture, simulation and robotic control.",
  },
  {
    title: "Artificial Intelligence",
    desc: "Machine learning, TinyML and selected AI applications on robotic hardware.",
  },
  {
    title: "Computer Vision",
    desc: "Image processing, object detection, tracking and visual interpretation.",
  },
  {
    title: "Control Systems",
    desc: "Motion control, feedback systems, PID tuning, actuator management and stability concepts.",
  },
  {
    title: "Communication Systems",
    desc: "Wireless connectivity, sensor networks, data transmission and device communication.",
  },
  {
    title: "CAD and Prototyping",
    desc: "Mechanical modelling, component design, assemblies and prototype fabrication planning.",
  },
];

function TechnicalFoundation() {
  return (
    <Section id="foundation" tag="Technical Foundation" title="The Engineering Disciplines Behind Our Work">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Robotics Is the Convergence of Multiple Technologies
        </p>
        <p className="muted rv" style={{ maxWidth: 820, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
          A functional robot is the result of several engineering disciplines working together. At X AI Robotics, our technical ecosystem brings attention to core interdisciplinary engineering areas:
        </p>
      </div>

      <div className="sec-grid-3 rv" style={{ marginTop: "44px" }}>
        {TECHNICAL_FOUNDATION.map((f, idx) => (
          <article key={f.title} className="sec-card">
            <span className="sec-card-num">0{idx + 1}</span>
            <h3 className="sec-card-title">{f.title}</h3>
            <p className="sec-card-text">{f.desc}</p>
          </article>
        ))}
      </div>

      <div className="sec-quote-box rv" style={{ maxWidth: 860, margin: "36px auto 0", textAlign: "center" }}>
        These disciplines form the technical foundation for understanding and developing modern robotic systems.
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 9. Education, research and innovation
   ========================================================================== */
const FLAGSHIP_PHASES = [
  {
    phase: "Phase 01",
    title: "Fundamentals (12 Technical Modules)",
    desc: "Builds core foundations across electronics, microcontrollers, embedded programming, sensors, actuators, communication, control systems, AI on hardware, CAD, computer vision and ROS 2.",
  },
  {
    phase: "Phase 02",
    title: "Project-Based Engineering (12 Builds)",
    desc: "Introduces hands-on project engineering, allowing participants to choose from 12 robotics builds according to their interests and skill levels.",
  },
  {
    phase: "Phase 03",
    title: "Optional R&D Incubation",
    desc: "Offers an open research opportunity for participants who want to explore original ideas. Approved concepts receive laboratory components and engineering mentorship.",
  },
];

const ENGINEERING_CYCLE = [
  "Conceptualisation",
  "Design",
  "Wiring",
  "Coding",
  "Testing",
  "Debugging",
  "Documentation",
  "Demonstration",
];

function EducationResearch() {
  return (
    <Section id="education-research" tag="Education & Innovation" title="Creating Opportunities for the Next Generation">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Beyond Learning. Towards Engineering and Discovery.
        </p>
        <div className="muted rv" style={{ maxWidth: 860, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
          <p style={{ marginBottom: "14px" }}>
            One of our important priorities is to encourage a stronger culture of robotics experimentation among students and aspiring engineers. The next generation of robotics professionals will need to understand more than programming alone. They will need exposure to mechanical systems, electronics, control theory, embedded software, artificial intelligence and practical problem-solving.
          </p>
          <p>
            Our <strong>six-month flagship robotics programme</strong> is designed around this multidisciplinary requirement:
          </p>
        </div>
      </div>

      <div className="sec-grid-3 rv" style={{ marginTop: "36px" }}>
        {FLAGSHIP_PHASES.map((p) => (
          <article key={p.phase} className="sec-card">
            <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>{p.phase}</span>
            <h3 className="sec-card-title">{p.title}</h3>
            <p className="sec-card-text">{p.desc}</p>
          </article>
        ))}
      </div>

      {/* Complete engineering cycle */}
      <div className="rv" style={{ maxWidth: 860, margin: "40px auto 0", textAlign: "center" }}>
        <h3 className="mono muted" style={{ fontSize: "12px", letterSpacing: "0.14em", marginBottom: "16px" }}>
          The Complete Engineering Cycle
        </h3>
        <ul className="pg-chips pg-chips-center">
          {ENGINEERING_CYCLE.map((step) => (
            <li key={step} className="mono" style={{ fontSize: "11px", padding: "6px 14px" }}>
              {step}
            </li>
          ))}
        </ul>
        <p className="muted" style={{ fontSize: "15px", marginTop: "18px", lineHeight: "1.7" }}>
          We also aim to extend robotics exposure beyond individual learners by supporting schools, colleges and universities through institutional programmes and laboratory partnerships.
        </p>
      </div>

      <div className="sec-callout-banner rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
        <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)" }}>
          &ldquo;Our belief is simple: tomorrow&apos;s robotics innovators should have the opportunity to start experimenting today.&rdquo;
        </p>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 10. Safety, responsibility and human-centred robotics
   ========================================================================== */
const SAFETY_PRINCIPLES = [
  {
    title: "Physical Safety",
    desc: "Robotic hardware, motors, batteries, moving mechanisms and tools must be handled according to appropriate safety procedures. Practical activities should be supervised according to participant age, equipment and risk.",
  },
  {
    title: "Human Oversight",
    desc: "AI-enabled and autonomous systems should operate within clearly defined boundaries. Human supervision and intervention should remain available where required.",
  },
  {
    title: "Data Protection",
    desc: "Robotic systems that collect images, audio, location or other information should be designed and operated with appropriate consent, access controls and data-handling practices.",
  },
  {
    title: "Cybersecurity",
    desc: "Connected robotic systems require attention to secure communication, access permissions, software updates and protection against unauthorised control.",
  },
  {
    title: "Reliability and Testing",
    desc: "A robotic system should be evaluated under its intended operating conditions. Performance claims should be supported by testing and validation.",
  },
  {
    title: "Responsible Innovation",
    desc: "Robotics should be explored in ways that respect people, communities, applicable laws and the environment.",
  },
];

function SafetyResponsibility() {
  return (
    <Section id="safety" tag="Ethics & Safety" title="Responsible Robotics. Human-Centred Innovation.">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Technology Must Advance with Responsibility
        </p>
        <p className="muted rv" style={{ maxWidth: 840, margin: "16px auto 0", fontSize: "15.5px", lineHeight: "1.75" }}>
          As robots become more capable and increasingly integrated into human environments, responsible development becomes essential. Robotics involves physical movement, electronic systems, software, communication and sometimes autonomous decision-making. Each of these elements creates responsibilities related to safety, reliability, security and appropriate use. At X AI Robotics, we believe robotics development and demonstrations should be approached with a strong emphasis on safe operating practices.
        </p>
      </div>

      <div className="sec-grid-3 rv" style={{ marginTop: "44px" }}>
        {SAFETY_PRINCIPLES.map((s, idx) => (
          <article key={s.title} className="sec-card">
            <span className="sec-card-num">0{idx + 1}</span>
            <h3 className="sec-card-title">{s.title}</h3>
            <p className="sec-card-text">{s.desc}</p>
          </article>
        ))}
      </div>

      <div className="sec-quote-box rv" style={{ maxWidth: 860, margin: "36px auto 0", textAlign: "center" }}>
        We believe technological progress is most valuable when innovation and responsibility develop together.
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 11. Our relationship with techcadd
   ========================================================================== */
function TechcaddRelationship() {
  return (
    <Section id="techcadd" tag="Ecosystem" title="Powered by the techcadd Ecosystem">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Connecting Technology Education with Robotics Innovation
        </p>
        <div className="muted rv" style={{ maxWidth: 860, margin: "20px auto 0", fontSize: "16px", lineHeight: "1.8" }}>
          <p style={{ marginBottom: "16px" }}>
            <strong>X AI Robotics</strong> is an initiative of the <strong>techcadd ecosystem</strong>, bringing together a wider commitment to technology education, practical skill development and emerging technology exploration.
          </p>
          <p style={{ marginBottom: "16px" }}>
            The relationship provides an important educational foundation for X AI Robotics, particularly in the areas of technical learning, institutional engagement, workshops and skill-oriented programmes.
          </p>
          <p style={{ marginBottom: "16px" }}>
            While X AI Robotics maintains its distinct identity and robotics-focused direction, its connection with techcadd reflects a shared interest in making emerging technologies more accessible and encouraging practical engagement with the digital and physical systems shaping the future.
          </p>
          <p>
            This association supports our ambition to connect robotics awareness, engineering education, laboratory development and innovation-oriented activities within a broader technology ecosystem.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 12. Looking ahead
   ========================================================================== */
function LookingAhead() {
  return (
    <Section id="looking-ahead" tag="Looking Ahead" title="The Road Ahead">
      <div className="hm-center">
        <p className="mono muted rv" style={{ fontSize: "12px", letterSpacing: "0.12em" }}>
          Building the Next Chapter of Robotics Innovation
        </p>
        <div className="muted rv" style={{ maxWidth: 860, margin: "20px auto 0", fontSize: "16px", lineHeight: "1.8" }}>
          <p style={{ marginBottom: "16px" }}>
            Our journey began in <strong>August 2025</strong> with the introduction of Chi Chi. That beginning represents an ongoing commitment to exploring the possibilities of robotics and intelligent machines.
          </p>
          <p style={{ marginBottom: "16px" }}>
            As the field evolves, we aim to expand our engagement across practical robotics services, institutional partnerships, laboratory development, technical demonstrations and research-oriented projects.
          </p>
          <p style={{ marginBottom: "16px" }}>
            Our future direction includes exploring new robotic platforms, expanding educational and institutional collaborations, encouraging prototype development and strengthening our connection with the wider robotics and engineering community.
          </p>
          <p style={{ marginBottom: "16px" }}>
            We recognise that building meaningful capabilities takes time, technical discipline, collaboration and continuous learning. Our ambition is to grow responsibly, develop practical services and create opportunities for more people and institutions to participate in the robotics ecosystem.
          </p>
          <p>
            We look forward to a future where intelligent machines can help solve meaningful challenges and where India contributes increasingly to the technologies that shape the world.
          </p>
        </div>

        <div className="sec-callout-banner rv" style={{ maxWidth: 860, margin: "36px auto 0" }}>
          <p style={{ fontSize: "20px", fontWeight: "600", color: "var(--text)" }}>
            X AI Robotics — Engineering Today for an Intelligent Tomorrow.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Section 13. About page closing CTA
   ========================================================================== */
function AboutClosingCta() {
  const root = useRef<HTMLElement>(null);
  const openServiceForm = useServiceForm();
  const goClick = useGoClick();
  useReveal(root);

  return (
    <section className="hm-band" ref={root} id="about-cta">
      <div className="container">
        <div className="hm-band-inner rv">
          <span className="mono muted" style={{ fontSize: "11px", letterSpacing: "0.14em" }}>
            Get Started · Partner With Us
          </span>
          <h2 className="h2" style={{ marginTop: "8px" }}>Be Part of the Robotics Revolution</h2>
          <p className="muted" style={{ maxWidth: 800, fontSize: "16px", lineHeight: "1.75" }}>
            Whether you are an educational institution looking to establish a robotics laboratory, a school planning a robotics workshop, a business exploring robotic applications or an aspiring engineer interested in building intelligent machines, X AI Robotics welcomes the opportunity to collaborate. Let&apos;s explore ideas, develop capabilities and create meaningful robotics experiences together.
          </p>

          <div className="sec-quote-box" style={{ maxWidth: 700, margin: "14px 0 22px" }}>
            &ldquo;Discover Robotics. Experience Innovation. Engineer the Future.&rdquo;
          </div>

          <p className="muted" style={{ fontSize: "15px", marginBottom: "20px" }}>
            Contact X AI Robotics to discuss your requirements, explore our services or plan an institutional partnership.
          </p>

          <div className="hm-actions">
            <button type="button" className="btn btn-primary" onClick={openServiceForm}>
              Partner With Us <span aria-hidden>→</span>
            </button>
            <a href="/services" className="btn btn-ghost" onClick={goClick("/services")}>
              <span className="btn-dot" /> Explore our services
            </a>
            <a href="/contact" className="btn btn-ghost" onClick={goClick("/contact")}>
              <span className="btn-dot" /> Contact us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Main About Page Export
   ========================================================================== */
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
      {/* Hero Header */}
      <PageHero
        eyebrow="Established August 2025 · An initiative of techcadd"
        title="About X AI Robotics"
        lede="Where Artificial Intelligence Meets the Physical World. Engineering the Future. Bringing Intelligence to Life."
        actions={[
          { label: "Partner With Us", service: true },
          { label: "Our Story", href: "#story", ghost: true },
        ]}
        stats={[
          ["Aug 2025", "Established"],
          ["Chi Chi", "AI Robot Dog Prototype"],
          ["techcadd", "Ecosystem Initiative"],
        ]}
      />

      {/* Section 1. About X AI Robotics — Our Story */}
      <AboutStory />

      {/* Section 2. Our Origin — The Story of Chi Chi */}
      <OriginChiChi />

      {/* Section 3. Our identity and philosophy */}
      <IdentityPhilosophy />

      {/* Section 4. Our Mission */}
      <AboutMission />

      {/* Section 5. Our Vision — India and the World */}
      <AboutVision />

      {/* Section 6. Our service philosophy */}
      <ServicePhilosophy />

      {/* Section 7. Our service portfolio */}
      <ServicePortfolio />

      {/* Section 8. Our technical foundation */}
      <TechnicalFoundation />

      {/* Section 9. Education, research and innovation */}
      <EducationResearch />

      {/* Section 10. Safety, responsibility and human-centred robotics */}
      <SafetyResponsibility />

      {/* Section 11. Our relationship with techcadd */}
      <TechcaddRelationship />

      {/* Section 12. Looking ahead */}
      <LookingAhead />

      {/* Section 13. About page closing CTA */}
      <AboutClosingCta />

      {/* Social and Testimonials */}
      <HomeTestimonials items={testimonials} />
      <FaqBlock items={faqs} lede="Answers to what students, parents and partners ask us most." />
      <HomeClosing social={site.social} />
    </main>
  );
}
