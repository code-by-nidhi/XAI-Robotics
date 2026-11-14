/** Real robot renders (background removed) that replace the old line-art illustrations. */
const PHOTOS = {
  humanoid: { file: "robot-humanoid", w: 620, h: 685, alt: "Humanoid robot" },
  arm: { file: "robot-arm", w: 576, h: 659, alt: "Six-axis robotic arm" },
  drone: { file: "robot-drone", w: 594, h: 302, alt: "Quadcopter drone" },
  chichi: { file: "chichi", w: 1199, h: 952, alt: "Chi Chi, the XAI Robotics AI robotic dog" },
} as const;

export type RobotPhotoName = keyof typeof PHOTOS;

export default function RobotPhoto({ name, alt }: { name: RobotPhotoName; alt?: string }) {
  const p = PHOTOS[name];
  return (
    <picture className="robot-photo">
      <source type="image/webp" srcSet={`/images/${p.file}.webp`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/${p.file}.png`}
        width={p.w}
        height={p.h}
        alt={alt ?? p.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}
