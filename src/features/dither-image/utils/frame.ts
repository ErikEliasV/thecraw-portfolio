import type { DitherFrame } from "@/features/dither-image/types";

export const FULL_FRAME: DitherFrame = { x: 0, y: 0, width: 1, height: 1 };

/**
 * Maps a container UV (0–1, top-left origin) to an image UV, with the image
 * covering the frame rectangle. Mirrors `frameUv` in the fragment shader.
 */
export function containerToImageUv(
  u: number,
  v: number,
  frame: DitherFrame,
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): [number, number] {
  const localU = (u - frame.x) / frame.width;
  const localV = (v - frame.y) / frame.height;
  const frameRatio =
    (frame.width * containerWidth) / (frame.height * containerHeight);
  const imageRatio = imageWidth / imageHeight;
  const scaleU = frameRatio > imageRatio ? 1 : frameRatio / imageRatio;
  const scaleV = frameRatio > imageRatio ? imageRatio / frameRatio : 1;

  return [(localU - 0.5) * scaleU + 0.5, (localV - 0.5) * scaleV + 0.5];
}
