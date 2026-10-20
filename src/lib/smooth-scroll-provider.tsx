"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;
const listeners = new Set<() => void>();

function setLenisInstance(next: Lenis | null) {
  lenisInstance = next;
  listeners.forEach((listener) => listener());
}

export function subscribeLenis(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLenis() {
  return lenisInstance;
}

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      anchors: true,
    });
    const onTick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    setLenisInstance(lenis);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [reducedMotion]);

  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  // Web fonts change text metrics: recompute trigger positions once loaded.
  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
    return () => {
      active = false;
    };
  }, []);

  return children;
}
