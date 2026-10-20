"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { EASE, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type SplitRevealProps = {
  as?: ElementType;
  children: ReactNode;
  /** Unit that slides up from under its line mask. */
  split?: "chars" | "words" | "lines";
  /** Play on mount or when the element scrolls into view. */
  trigger?: "load" | "scroll";
  delay?: number;
  className?: string;
};

const STAGGER = { chars: 0.025, words: 0.06, lines: 0.1 } as const;

/** Text revealed by chars, words or lines, masked per line (GSAP SplitText). */
export function SplitReveal({
  as: Tag = "p",
  children,
  split = "words",
  trigger = "scroll",
  delay = 0,
  className,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          gsap.set(element, { visibility: "visible" });
          if (context.conditions?.reduced) return;

          const instance = SplitText.create(element, {
            type: split === "lines" ? "lines" : `lines,${split}`,
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              // Tight Figma line-heights: give masks room for ascenders and
              // descenders without moving the lines.
              gsap.set(self.masks, {
                paddingTop: "0.12em",
                paddingBottom: "0.18em",
                marginTop: "-0.12em",
                marginBottom: "-0.18em",
              });
              return gsap.from(self[split], {
                yPercent: 110,
                duration: split === "chars" ? 1.1 : 1,
                ease: EASE.expo,
                stagger: STAGGER[split],
                delay,
                scrollTrigger:
                  trigger === "scroll"
                    ? { trigger: element, start: "top 88%", once: true }
                    : undefined,
              });
            },
          });
          return () => instance.revert();
        },
      );
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn("invisible", className)}>
      {children}
    </Tag>
  );
}
