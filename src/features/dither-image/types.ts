/** A gradient-map stop: a Tailwind color token (without `--color-`) at a 0–1 position. */
export type DitherPaletteStop = {
  token: string;
  position: number;
};

/** Up to four stops, in the same order and proportion as the Figma gradient map. */
export type DitherPalette = readonly DitherPaletteStop[];

/**
 * Where the image rectangle sits relative to the container, as fractions of
 * its width/height (Figma lets the image overflow the frame). The image
 * covers this rectangle like `object-fit: cover`.
 */
export type DitherFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * - `intro`: forms on load, coarsens as the section scrolls away (hero).
 * - `scroll`: forms when the section enters the viewport (footer).
 * - `none`: a single static render.
 */
export type DitherAnimation = "intro" | "scroll" | "none";

export type DitherImageProps = {
  src: string;
  palette: DitherPalette;
  /** Accessible description; omit for decorative images. */
  alt?: string;
  /** Size of a dither cell in CSS pixels. */
  pixelSize?: number;
  /** Opacity of the image layer over the container background. */
  opacity?: number;
  /** Gradient-map offset, as in Figma (−0.15 = −15%). */
  offset?: number;
  /** Random per-cell offset amplitude, as in Figma (0.5 = 50%). */
  scatter?: number;
  frame?: DitherFrame;
  animation?: DitherAnimation;
  className?: string;
};

export type RGB = readonly [number, number, number];

export type ResolvedPalette = {
  colors: RGB[];
  positions: number[];
};
