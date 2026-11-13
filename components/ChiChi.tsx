/**
 * Chi Chi, the XAI Robotics AI robotic dog — background removed, full
 * resolution. The WebP is lossless (pixel-identical to the PNG), so browsers
 * that support it get the lighter file with no loss in quality.
 *
 * The grey/black mood (glow, floor shadow, soft vignette) is applied in CSS
 * (`.chichi`), so the image file itself stays untouched.
 */
export default function ChiChi({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <figure className={`chichi ${className}`}>
      <picture>
        <source type="image/webp" srcSet="/images/chichi.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/chichi.png"
          width={1199}
          height={952}
          alt="Chi Chi, the XAI Robotics AI robotic dog"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      </picture>
    </figure>
  );
}
