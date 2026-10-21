"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type UnderRevealProps = {
  children: ReactNode;
  className?: string;
  /** Share of the travel the content starts behind the scroll. */
  lag?: number;
};

/**
 * Content of a clipping (`overflow-hidden`) section that slides out from
 * under the section above it: it starts raised and catches up with the scroll
 * while that section leaves, like a slower parallax layer.
 */
export function UnderReveal({
  children,
  className,
  lag = 0.5,
}: UnderRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const content = ref.current;
      const section = content?.parentElement;
      if (!content || !section) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Scroll until the section top reaches the viewport top, or until the
        // page ends for a section shorter than the viewport (the footer).
        const travel = () => Math.min(section.offsetHeight, window.innerHeight);
        const setY = gsap.quickSetter(content, "y", "px");
        // Before and after the reveal none of the content shows, so it rests
        // in place there and nested triggers measure it untouched.
        const apply = (progress: number) =>
          setY(
            progress > 0 && progress < 1 ? -(1 - progress) * travel() * lag : 0,
          );

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: () => `top ${window.innerHeight - travel()}px`,
          onUpdate: (self) => apply(self.progress),
        });

        // Every refresh measures the page with the content in place.
        const onRefreshInit = () => setY(0);
        const onRefresh = () => apply(trigger.progress);
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
        ScrollTrigger.addEventListener("refresh", onRefresh);
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
          ScrollTrigger.removeEventListener("refresh", onRefresh);
          gsap.set(content, { clearProps: "transform" });
        };
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
    </div>
  );
}
