"use client";

const PHRASES = [
  "An initiative of techcadd",
  "Engineer the Future",
  "Build Intelligent Machines",
  "X AI Robotics",
];

/** One half of a band's loop: the phrases repeated enough to overfill wide screens. */
function Run({ hidden = false }: { hidden?: boolean }) {
  const items = Array.from({ length: 4 }, () => PHRASES).flat();
  return (
    <div className="xb-run" aria-hidden={hidden || undefined}>
      {items.map((p, i) => (
        <span key={i} className="xb-item">
          <span className="xb-star" aria-hidden="true">
            ✦
          </span>
          {p}
        </span>
      ))}
    </div>
  );
}

/**
 * Two marquee bands crossing diagonally (an "X"): a white band on top and a
 * dark-grey band behind, scrolling in opposite directions.
 */
export default function CrossBands() {
  return (
    <section className="xb" aria-label="A techcadd initiative — An Innovation by techcadd — XAI Robotics">
      <div className="xb-band xb-back">
        <div className="xb-track">
          <Run hidden />
          <Run hidden />
        </div>
      </div>
      <div className="xb-band xb-front">
        <div className="xb-track">
          <Run hidden />
          <Run hidden />
        </div>
      </div>
    </section>
  );
}
