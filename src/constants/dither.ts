import type { DitherFrame, DitherImageProps } from "@/features/dither-image";
import { asset } from "@/utils/asset";

type DitherPreset = Omit<DitherImageProps, "alt" | "animation" | "className">;

/** Plain cover of the container, used on small screens. */
const COVER_FRAME: DitherFrame = { x: 0, y: 0, width: 1, height: 1 };

/**
 * Figma "Desktop - 1" palette (white → RED GRAW → deep red), rendered like the
 * footer at the user's request: gradient map with grain, 3px pixels.
 */
export const HERO_DITHER: DitherPreset = {
  src: asset("/images/home/hero-knight.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "red-graw", position: 0.5 },
    { token: "red-graw-deep", position: 1 },
  ],
  pixelSize: 3.75,
  scatter: 0.3,
  quantize: "posterize",
  levels: 16,
  // Image rectangle 2274×2069 at (-40, -217.66) in the 1920×1080 frame.
  frame: { x: -0.02083, y: -0.20154, width: 1.18438, height: 1.91604 },
  mobileFrame: COVER_FRAME,
};

/** Figma "Footer": image at 29% over RED GRAW, offset −15%, scatter 50%, then Pixelate (2px, 16 levels). */
export const FOOTER_DITHER: DitherPreset = {
  src: asset("/images/shared/footer-figure.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "red-graw", position: 0.5 },
    { token: "black", position: 1 },
  ],
  // Visible pixels: 3px cells (Figma pixelates at 2px).
  pixelSize: 3.75,
  opacity: 0.29,
  offset: -0.15,
  scatter: 0.5,
  quantize: "posterize",
  levels: 16,
  // Image rectangle 1920×3227 at (0, -297) in the 1920×937 frame.
  frame: { x: 0, y: -0.31697, width: 1, height: 3.44397 },
  mobileFrame: COVER_FRAME,
};

/** Figma "Studio" hero: image at 14% over BLACK GRAW, offset −15%, scatter 50%. */
export const STUDIO_DITHER: DitherPreset = {
  src: asset("/images/studio/hero-texture.webp"),
  palette: [
    { token: "black", position: 0 },
    { token: "silver", position: 0.5 },
    { token: "black", position: 1 },
  ],
  pixelSize: 1,
  opacity: 0.14,
  offset: -0.15,
  scatter: 0.5,
  quantize: "none",
  frame: { x: -0.0576, y: -0.4935, width: 1.1152, height: 2.9861 },
  mobileFrame: COVER_FRAME,
};
