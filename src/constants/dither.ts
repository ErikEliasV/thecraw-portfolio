import type { DitherImageProps } from "@/features/dither-image";

type DitherPreset = Omit<DitherImageProps, "alt" | "animation" | "className">;

/** Figma "Desktop - 1": gradient map white → RED GRAW → deep red, Bayer dither. */
export const HERO_DITHER: DitherPreset = {
  src: "/images/home/hero-knight.webp",
  palette: [
    { token: "white", position: 0 },
    { token: "red-graw", position: 0.5 },
    { token: "red-graw-deep", position: 1 },
  ],
  pixelSize: 1,
  // Image rectangle 2274×2069 at (-40, -217.66) in the 1920×1080 frame.
  frame: { x: -0.02083, y: -0.20154, width: 1.18438, height: 1.91604 },
};

/** Figma "Footer": image at 29% over RED GRAW, offset −15%, scatter 50%, pixelate 2. */
export const FOOTER_DITHER: DitherPreset = {
  src: "/images/shared/footer-figure.webp",
  palette: [
    { token: "white", position: 0 },
    { token: "red-graw", position: 0.5 },
    { token: "black", position: 1 },
  ],
  pixelSize: 2,
  opacity: 0.29,
  offset: -0.15,
  scatter: 0.5,
  // Image rectangle 1920×3227 at (0, -297) in the 1920×937 frame.
  frame: { x: 0, y: -0.31697, width: 1, height: 3.44397 },
};

/** Figma "Studio" hero: image at 14% over BLACK GRAW, offset −15%, scatter 50%. */
export const STUDIO_DITHER: DitherPreset = {
  src: "/images/studio/hero-texture.webp",
  palette: [
    { token: "black", position: 0 },
    { token: "silver", position: 0.5 },
    { token: "black", position: 1 },
  ],
  pixelSize: 1,
  opacity: 0.14,
  offset: -0.15,
  scatter: 0.5,
  frame: { x: -0.0576, y: -0.4935, width: 1.1152, height: 2.9861 },
};
