const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

export default function RobotEye() {
  return (
    <svg className="eye" viewBox="-200 -200 400 400" aria-hidden="true">
      <defs>
        <linearGradient id="eye-chrome" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#7f93b0" />
          <stop offset="0.55" stopColor="#1a2436" />
          <stop offset="1" stopColor="#d4e4f7" />
        </linearGradient>
        <radialGradient id="eye-iris" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#0d1a2e" />
          <stop offset="0.7" stopColor="#050a14" />
          <stop offset="1" stopColor="#16263d" />
        </radialGradient>
        <radialGradient id="eye-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#22e1ff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#22e1ff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#22e1ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="eye-r1">
        <circle r="192" fill="none" stroke="rgba(34,225,255,.25)" strokeWidth="1" strokeDasharray="2 7" />
        <path d="M0 -198 L5 -190 L-5 -190 Z" fill="#22e1ff" />
      </g>

      <g className="eye-ticks">
        {TICKS.map((a) => (
          <line
            key={a}
            x1="0"
            y1={a % 30 === 0 ? -160 : -166}
            x2="0"
            y2="-174"
            stroke="rgba(34,225,255,.45)"
            strokeWidth={a % 30 === 0 ? 2 : 1}
            transform={`rotate(${a})`}
          />
        ))}
      </g>

      <g className="eye-r2">
        <circle r="148" fill="none" stroke="#22e1ff" strokeOpacity=".7" strokeWidth="3" strokeDasharray="120 40 30 40 220 80" />
        <circle r="140" fill="none" stroke="rgba(34,225,255,.18)" strokeWidth="1" />
      </g>

      <g className="eye-r3">
        <circle r="128" fill="none" stroke="url(#eye-chrome)" strokeWidth="14" />
        <circle r="128" fill="none" stroke="#04070d" strokeWidth="2" strokeDasharray="4 22" />
      </g>

      <circle r="112" fill="#050913" stroke="rgba(34,225,255,.2)" />

      <g className="eye-iris">
        <circle r="92" fill="url(#eye-iris)" stroke="url(#eye-chrome)" strokeWidth="4" />
        <circle r="72" fill="none" stroke="rgba(34,225,255,.5)" strokeWidth="1.5" />
        <g className="eye-aperture">
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d="M0 -60 L22 -28 L0 -34 Z"
              fill="rgba(34,225,255,.07)"
              stroke="rgba(34,225,255,.25)"
              strokeWidth=".8"
              transform={`rotate(${i * 45})`}
            />
          ))}
        </g>
        <circle r="38" fill="#02040a" stroke="url(#eye-chrome)" strokeWidth="5" />
        <circle className="eye-core" r="16" fill="url(#eye-glow)" />
        <circle r="5" fill="#e8fbff" />
        <ellipse cx="-22" cy="-24" rx="12" ry="6" fill="#fff" opacity=".55" transform="rotate(-35 -22 -24)" />
      </g>
    </svg>
  );
}
