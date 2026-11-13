"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Draws every `.robot-art .draw` stroke inside `scope` as its artwork scrolls into view. */
export function useDraw(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      gsap.utils.toArray<SVGSVGElement>(".robot-art", scope.current).forEach((svg) => {
        gsap.to(svg.querySelectorAll(".draw"), {
          strokeDashoffset: 0,
          duration: 1.8,
          stagger: 0.06,
          ease: "power2.inOut",
          scrollTrigger: { trigger: svg, start: "top 85%", once: true },
        });
      });
    },
    { scope }
  );
}
