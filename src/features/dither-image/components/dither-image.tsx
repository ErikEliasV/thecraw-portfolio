"use client";

import dynamic from "next/dynamic";
import { useWebGLSupport } from "@/features/dither-image/hooks/use-webgl-support";
import type { DitherImageProps } from "@/features/dither-image/types";
import { FULL_FRAME } from "@/features/dither-image/utils/frame";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/utils/cn";

const DitherCanvas = dynamic(
  () =>
    import("@/features/dither-image/components/dither-canvas").then(
      (module) => module.DitherCanvas,
    ),
  { ssr: false },
);

const DitherFallback = dynamic(
  () =>
    import("@/features/dither-image/components/dither-fallback").then(
      (module) => module.DitherFallback,
    ),
  { ssr: false },
);

/**
 * Image rendered through the Figma gradient map + ordered dither. Animated in
 * WebGL; a static 2D-canvas render is used without WebGL2 or with reduced motion.
 * Fills its positioned parent, whose background shows until the image forms.
 */
export function DitherImage({
  src,
  palette,
  alt,
  pixelSize = 1,
  opacity = 1,
  offset = 0,
  scatter = 0,
  frame = FULL_FRAME,
  mobileFrame = frame,
  animation = "intro",
  className,
}: DitherImageProps) {
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 64rem)");
  const options = {
    src,
    palette,
    pixelSize,
    opacity,
    offset,
    scatter,
    frame: desktop ? frame : mobileFrame,
  };

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {webgl === null ? null : webgl && !reducedMotion ? (
        <DitherCanvas {...options} animation={animation} />
      ) : (
        <DitherFallback {...options} />
      )}
    </div>
  );
}
