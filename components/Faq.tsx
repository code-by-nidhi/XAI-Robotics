"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

const FAQS = [
  ["Who can join the programme?", "Students from Class 9 onwards, college students and early professionals who want to build real robots. Phase 1 starts from the fundamentals, so curiosity matters more than experience."],
  ["Do I need to know coding before I start?", "No. Phase 1 teaches C/C++ and Python for embedded systems from the basics. Prior coding experience helps you move faster."],
  ["Is the project kit included in the programme fee?", "The kit is purchased separately in Phase 2, and the finished robot is yours to keep."],
  ["How do I choose my Phase 2 project?", "At the end of Phase 1, your mentor helps you pick one of the 12 projects based on your interests and skill level."],
  ["Is the R&D phase compulsory?", "No. Phase 3 is optional and designed for students who want to research and build their own idea. Approved projects receive components from our lab."],
  ["Do you teach ROS, SolidWorks and OpenCV?", "Yes. Phase 1 includes dedicated modules on embedded systems with FreeRTOS, SolidWorks CAD, OpenCV computer vision and ROS 2 with Gazebo simulation, and you apply them in your Phase 2 project."],
  ["Do I need to buy SolidWorks or other software?", "No. You practise in our lab during the programme. Most other tools we use, including ROS 2, OpenCV, KiCad and Python, are free and open source."],
  ["Can I learn robotics online?", "Phase 1 theory and programming can be followed in live online sessions. Building, testing and R&D need real hardware, so those phases take place in our robotics lab."],
  ["Is the lab safe for school students?", "Yes. Soldering, battery handling and power tools are always supervised by mentors, and safe-practice training is part of Module 01."],
  ["Do I need my own laptop?", "A laptop helps you practise coding at home and keep your project files. Ask our team about lab system availability for your batch."],
  ["Can my school or college book a robotics workshop?", "Yes. We run robotics workshops, bootcamps and live demonstrations for schools, colleges and universities, and can set up a complete robotics lab through our franchise and B2B programme."],
  ["Will I receive a certificate?", "Yes. Students who complete the programme receive an XAI Robotics certificate, along with a portfolio of their project work."],
];

export default function Faq() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section ruled" id="faq" ref={root}>
      <div className="container">
        <div className="sec-head">
          <span className="section-tag rv">[15] Questions</span>
          <h2 className="h2 rv">
            Frequently asked <span className="accent">questions.</span>
          </h2>
        </div>
        <div className="faq-list">
          {FAQS.map(([q, a]) => (
            <details key={q} className="panel rv">
              <summary>{q}</summary>
              <p className="muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
