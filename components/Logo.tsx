export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="logo-mark"
      draggable={false}
    />
  );
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-name">XAI</span>
        <span className="logo-sub">ROBOTICS</span>
      </span>
    </span>
  );
}
