"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Lifts every `.robot-photo` inside `scope` into view as it scrolls onto the screen. */
export function usePhotoReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>(".robot-photo img", scope.current).forEach((img) => {
        gsap.from(img, {
          opacity: 0,
          y: 40,
          scale: 0.94,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: img, start: "top 88%", once: true },
        });
      });
    },
    { scope }
  );
}
