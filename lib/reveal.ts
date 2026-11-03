"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";

/** Fades/slides every `.rv` element inside `scope` into view, batched as they enter the viewport. */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>(".rv", scope.current);
      gsap.set(els, { y: 40, opacity: 0 });
      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power3.out", overwrite: true }),
      });
    },
    { scope }
  );
}
