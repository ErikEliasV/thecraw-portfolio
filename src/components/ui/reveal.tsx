"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Delay between `[data-reveal]` children. */
  stagger?: number;
  /** Horizontal instead of vertical entrance. */
  axis?: "x" | "y";
};

/**
 * Fades `[data-reveal]` children (or the element itself) in with an offset
 * when it scrolls into view.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  stagger = 0.12,
  axis = "y",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const items = element.querySelectorAll("[data-reveal]");
        gsap.from(items.length ? items : element, {
          [axis]: 48,
          autoAlpha: 0,
          duration: 1,
          ease: EASE.out,
          stagger,
          scrollTrigger: { trigger: element, start: "top 85%", once: true },
        });
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
