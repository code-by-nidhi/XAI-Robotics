"use client";

/** Technologies and principles behind AI robotics — two rows scrolling in opposite directions. */
const ROW_OUTLINE = [
  "Kinematics",
  "Computer Vision",
  "ROS 2",
  "Sensor Fusion",
  "SLAM",
  "PID Control",
  "Embedded C",
  "Path Planning",
];
const ROW_FILLED = [
  "Machine Learning",
  "Edge AI",
  "Mechatronics",
  "Inverse Kinematics",
  "TinyML",
  "Motion Control",
  "Reinforcement Learning",
  "Microcontrollers",
];

function Star() {
  return (
    <svg className="tm-star" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.7 6.6 4.9 10.8 12 12-7.1 1.2-11.3 5.4-12 12-.7-6.6-4.9-10.8-12-12C7.1 10.8 11.3 6.6 12 0z" />
    </svg>
  );
}

/** One copy of a row; rendered twice so the CSS loop is seamless. */
function Run({ words, hidden = false }: { words: string[]; hidden?: boolean }) {
  return (
    <div className="tm-run" aria-hidden={hidden || undefined}>
      {words.map((w) => (
        <span key={w} className="tm-item">
          <span className="tm-word">{w}</span>
          <Star />
        </span>
      ))}
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section className="tm" aria-label="Technologies and principles in AI robotics">
      <div className="tm-row tm-outline">
        <div className="tm-track">
          <Run words={ROW_OUTLINE} />
          <Run words={ROW_OUTLINE} hidden />
        </div>
      </div>
      <div className="tm-row tm-filled">
        <div className="tm-track">
          <Run words={ROW_FILLED} />
          <Run words={ROW_FILLED} hidden />
        </div>
      </div>
    </section>
  );
}
