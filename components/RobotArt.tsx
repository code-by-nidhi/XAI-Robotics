// Line-art robot illustrations. Every stroke uses pathLength=1 so it can be "drawn" with stroke-dashoffset.
const P = { pathLength: 1, className: "draw" } as const;

export function Humanoid() {
  return (
    <svg viewBox="0 0 300 300" className="robot-art">
      <path {...P} d="M108 72 Q150 36 192 72 L198 142 Q150 182 102 142 Z" />
      <path {...P} d="M116 96 L184 96 L178 122 L122 122 Z" />
      <path {...P} d="M128 109 L172 109" className="draw glow" />
      <circle {...P} cx="100" cy="110" r="9" />
      <circle {...P} cx="200" cy="110" r="9" />
      <path {...P} d="M136 160 L136 186 M164 160 L164 186 M150 162 L150 188" />
      <path {...P} d="M56 280 L64 232 Q84 196 150 190 Q216 196 236 232 L244 280" />
      <path {...P} d="M100 210 L112 280 M200 210 L188 280" />
      <circle {...P} cx="150" cy="236" r="16" />
      <circle {...P} cx="150" cy="236" r="6" className="draw glow" />
      <path {...P} d="M150 56 L150 40 M140 40 L160 40" />
    </svg>
  );
}

export function Manipulator() {
  return (
    <svg viewBox="0 0 300 300" className="robot-art">
      <path {...P} d="M80 272 L220 272 L204 248 L96 248 Z" />
      <rect {...P} x="122" y="226" width="56" height="22" rx="3" />
      <circle {...P} cx="150" cy="214" r="20" />
      <path {...P} d="M138 200 L104 112 M162 200 L124 104" />
      <circle {...P} cx="112" cy="100" r="16" />
      <path {...P} d="M124 92 L202 70 M120 112 L204 86" />
      <circle {...P} cx="210" cy="78" r="11" />
      <path {...P} d="M218 70 L244 56 L252 66 M220 88 L248 92 L246 104" />
      <circle {...P} cx="150" cy="214" r="6" className="draw glow" />
      <path {...P} d="M40 272 L260 272" />
    </svg>
  );
}

export function Quadruped() {
  return (
    <svg viewBox="0 0 300 300" className="robot-art">
      <path {...P} d="M76 122 L214 122 L230 144 L214 166 L76 166 L62 144 Z" />
      <rect {...P} x="226" y="108" width="44" height="30" rx="6" />
      <path {...P} d="M236 123 L262 123" className="draw glow" />
      <path {...P} d="M92 166 L80 208 L98 252 M118 166 L134 208 L118 252" />
      <path {...P} d="M176 166 L164 208 L182 252 M202 166 L218 208 L202 252" />
      <circle {...P} cx="80" cy="208" r="6" />
      <circle {...P} cx="134" cy="208" r="6" />
      <circle {...P} cx="164" cy="208" r="6" />
      <circle {...P} cx="218" cy="208" r="6" />
      <path {...P} d="M100 144 L190 144" />
      <path {...P} d="M30 256 L280 256" />
    </svg>
  );
}

export function Drone() {
  return (
    <svg viewBox="0 0 300 300" className="robot-art">
      <rect {...P} x="118" y="118" width="64" height="64" rx="14" />
      <path {...P} d="M122 122 L92 92 M178 122 L208 92 M122 178 L92 208 M178 178 L208 208" />
      <circle {...P} cx="80" cy="80" r="34" />
      <circle {...P} cx="220" cy="80" r="34" />
      <circle {...P} cx="80" cy="220" r="34" />
      <circle {...P} cx="220" cy="220" r="34" />
      <path {...P} d="M52 80 L108 80 M192 80 L248 80 M52 220 L108 220 M192 220 L248 220" className="draw rotor" />
      <circle {...P} cx="150" cy="150" r="14" />
      <circle {...P} cx="150" cy="150" r="5" className="draw glow" />
    </svg>
  );
}
