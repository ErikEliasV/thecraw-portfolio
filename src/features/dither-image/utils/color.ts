import type { DitherQuantize } from "@/features/dither-image/types";

/**
 * Figma treats the image texture as linear and converts it to sRGB before
 * taking the luminance. Mirrors `figmaLuma` in the shader.
 */
export function figmaLuma(r: number, g: number, b: number) {
  const toSrgb = (c: number) =>
    c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return 0.2126 * toSrgb(r) + 0.7152 * toSrgb(g) + 0.0722 * toSrgb(b);
}

/** Per-channel quantization of the Figma Dither / Pixelate effects. */
export function quantizeChannel(
  value: number,
  mode: DitherQuantize,
  levels: number,
  threshold: number,
) {
  if (mode === "none") return value;
  const steps = levels - 1;
  const biased = mode === "ordered" ? value + (threshold - 0.5) / steps : value;
  return Math.min(1, Math.max(0, Math.floor(biased * steps + 0.5) / steps));
}

/**
 * Figma rasterizes effects at 1.25x and downsamples: a "pixel size 1" cell is
 * 0.8 CSS px. Measured against a 1:1 Figma render of the hero.
 */
export const FIGMA_RENDER_SCALE = 1.25;

/** Ordered-dither subsamples per axis on a 1x screen (halved on 2x). */
export const SUBSAMPLES_AT_1X = 4;

/**
 * Device-pixel size of a dither cell and subsamples per axis. Sub-pixel cells
 * (Figma's 1.25x raster) are supersampled; visible cells snap to whole pixels.
 */
export function ditherCellSize(pixelSize: number, pixelRatio: number) {
  const cell = (pixelSize * pixelRatio) / FIGMA_RENDER_SCALE;
  if (cell >= 1.5) return { cell: Math.round(cell), subsamples: 1 };
  return {
    cell,
    subsamples: Math.max(1, Math.round(SUBSAMPLES_AT_1X / pixelRatio)),
  };
}
