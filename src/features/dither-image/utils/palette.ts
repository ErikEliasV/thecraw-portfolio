import type {
  DitherPalette,
  ResolvedPalette,
  RGB,
} from "@/features/dither-image/types";

export const MAX_PALETTE_STOPS = 4;

/** Reads a theme color token from CSS and returns it as 0–1 sRGB. */
function readTokenColor(context: CanvasRenderingContext2D, token: string): RGB {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${token}`)
    .trim();
  if (!value) throw new Error(`Unknown color token: ${token}`);

  context.clearRect(0, 0, 1, 1);
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export function resolvePalette(palette: DitherPalette): ResolvedPalette {
  if (palette.length < 2 || palette.length > MAX_PALETTE_STOPS) {
    throw new Error(`A dither palette needs 2–${MAX_PALETTE_STOPS} stops.`);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is not available.");

  return {
    colors: palette.map((stop) => readTokenColor(context, stop.token)),
    positions: palette.map((stop) => stop.position),
  };
}

/** Ordered dither between the two palette stops around `t`. Mirrors the shader. */
export function ditherPalette(
  palette: ResolvedPalette,
  t: number,
  threshold: number,
): RGB {
  const { colors, positions } = palette;
  if (t <= positions[0]) return colors[0];

  for (let i = 0; i < positions.length - 1; i++) {
    const start = positions[i];
    const end = positions[i + 1];
    if (t <= end) {
      const fraction = (t - start) / Math.max(end - start, 1e-5);
      return fraction > threshold ? colors[i + 1] : colors[i];
    }
  }
  return colors[colors.length - 1];
}
