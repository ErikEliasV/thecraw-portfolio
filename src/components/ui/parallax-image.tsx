"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type ParallaxImageProps = {
  src: string;
  alt: string;
  /** Classes for the clipping wrapper (defaults to filling its parent). */
  className?: string;
  /** Classes for the image, e.g. a Figma crop via `object-[x_y]`. */
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Travel in percent of the image height. */
  amount?: number;
};

/** Cover image that drifts against the scroll. */
export function ParallaxImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  amount = 5,
}: ParallaxImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "img",
          { yPercent: -amount, scale: 1 + (amount * 2.5) / 100 },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
      return () => media.revert();
    },
    { scope: wrapperRef },
  );

  return (
    <div
      ref={wrapperRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover will-change-transform", imageClassName)}
      />
    </div>
  );
}
