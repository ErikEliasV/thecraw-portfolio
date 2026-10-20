"use client";

import { useRef, type ReactNode } from "react";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type MarqueeProps = {
  children: ReactNode;
  /** Loop speed in pixels per second. */
  speed?: number;
  className?: string;
  /** Applied to each copy of the items (gap and trailing padding must match). */
  itemsClassName?: string;
};

const HOVER_PACE = 0.15;

/**
 * Infinite horizontal loop. The constant-speed loop slows down on hover and
 * speeds up with scroll velocity; it stays still with reduced motion.
 */
export function Marquee({
  children,
  speed = 60,
  className,
  itemsClassName,
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const distance = track.scrollWidth / 2;
        const loop = gsap.to(track, {
          x: -distance,
          duration: distance / speed,
          ease: "none",
          repeat: -1,
        });
        const pace = gsap.quickTo(loop, "timeScale", {
          duration: 0.5,
          ease: EASE.out,
        });
        let hovered = false;
        let boost = 0;
        const update = () => pace(hovered ? HOVER_PACE : 1 + boost);

        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            boost = Math.min(Math.abs(self.getVelocity()) / 1500, 2);
            update();
          },
        });

        const onEnter = () => {
          hovered = true;
          update();
        };
        const onLeave = () => {
          hovered = false;
          update();
        };
        root.addEventListener("mouseenter", onEnter);
        root.addEventListener("mouseleave", onLeave);
        return () => {
          root.removeEventListener("mouseenter", onEnter);
          root.removeEventListener("mouseleave", onLeave);
        };
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={cn("overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-max">
        <div className={cn("flex shrink-0", itemsClassName)}>{children}</div>
        <div aria-hidden inert className={cn("flex shrink-0", itemsClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
