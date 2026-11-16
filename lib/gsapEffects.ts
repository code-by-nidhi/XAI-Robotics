"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "./gsap";

/**
 * Attaches smooth GSAP 3D interactive tilt to elements matching `selector` inside `containerRef`.
 * Reacts to pointer coordinates with subtle 3D perspective and resets smoothly on leave.
 */
export function useGsapTilt(containerRef: RefObject<HTMLElement | null>, selector = ".gsap-tilt") {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cards = root.querySelectorAll<HTMLElement>(selector);
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      // Set perspective on card parent or card itself
      gsap.set(card, { transformPerspective: 1000, transformStyle: "preserve-3d" });

      const onMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width - 0.5) * 2; // -1 to 1
        const yPercent = (y / rect.height - 0.5) * 2; // -1 to 1

        gsap.to(card, {
          rotateY: xPercent * 7,
          rotateX: -yPercent * 7,
          y: -4,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onMouseLeave = () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);

      cleanups.push(() => {
        card.removeEventListener("mousemove", onMouseMove);
        card.removeEventListener("mouseleave", onMouseLeave);
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [containerRef, selector]);
}

/**
 * Smooth GSAP vertical floating animation for badges, indicators, and chips.
 */
export function useGsapFloating(containerRef: RefObject<HTMLElement | null>, selector = ".gsap-float") {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const elements = root.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    const tween = gsap.to(elements, {
      y: -6,
      duration: 2.4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
    });

    return () => {
      tween.kill();
    };
  }, [containerRef, selector]);
}
