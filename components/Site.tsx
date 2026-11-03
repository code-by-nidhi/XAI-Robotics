"use client";

import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Cursor from "./Cursor";
import Nav from "./Nav";
import Hero from "./Hero";
import Manifesto from "./Manifesto";
import Marquee from "./Marquee";
import Anatomy from "./Anatomy";
import Fleet from "./Fleet";
import Core from "./Core";
import Process from "./Process";
import WhyNow from "./WhyNow";
import Programme from "./Programme";
import Toolchain from "./Toolchain";
import Projects from "./Projects";
import Hardware from "./Hardware";
import RnDLab from "./RnDLab";
import Audience from "./Audience";
import Events from "./Events";
import Partner from "./Partner";
import Faq from "./Faq";
import Contact from "./Contact";
import Footer from "./Footer";

export default function Site() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const navigate = useCallback((target: string) => {
    lenisRef.current?.scrollTo(target, { duration: 1.6 });
  }, []);

  const lockScroll = useCallback((locked: boolean) => {
    if (locked) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, []);

  return (
    <>
      <Cursor />
      <div className="lab-bg" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <Nav onNavigate={navigate} />
      <main>
        <Hero onNavigate={navigate} />
        <Manifesto />
        <Marquee />
        <Anatomy />
        <Fleet />
        <Core />
        <Process />
        <WhyNow />
        <Programme />
        <Toolchain />
        <Projects onNavigate={navigate} onLock={lockScroll} />
        <Hardware />
        <RnDLab />
        <Audience />
        <Events onNavigate={navigate} />
        <Partner onNavigate={navigate} />
        <Faq />
        <Contact />
      </main>
      <Footer onNavigate={navigate} />
    </>
  );
}
