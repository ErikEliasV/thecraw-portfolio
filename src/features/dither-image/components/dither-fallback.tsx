"use client";

import { useEffect, useRef } from "react";
import type { DitherFrame, DitherPalette } from "@/features/dither-image/types";
import {
  BAYER_SIZE,
  createBayerThresholds,
} from "@/features/dither-image/utils/bayer";
import { containerToImageUv } from "@/features/dither-image/utils/frame";
import { hash2d } from "@/features/dither-image/utils/hash";
import {
  ditherPalette,
  resolvePalette,
} from "@/features/dither-image/utils/palette";

type DitherFallbackProps = {
  src: string;
  palette: DitherPalette;
  pixelSize: number;
  opacity: number;
  offset: number;
  scatter: number;
  frame: DitherFrame;
};

const MAX_DPR = 2;

/**
 * Static render on a 2D canvas (no WebGL, or reduced motion): same gradient
 * map, palette and Bayer dither as the shader, without animation.
 */
export function DitherFallback({
  src,
  palette,
  pixelSize,
  opacity,
  offset,
  scatter,
  frame,
}: DitherFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;

    let cancelled = false;
    let source: ImageData | null = null;
    let frameRequest = 0;
    const resolved = resolvePalette(palette);
    const thresholds = createBayerThresholds();

    const draw = () => {
      if (!source) return;
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
      const canvasWidth = Math.round(width * dpr);
      const canvasHeight = Math.round(height * dpr);
      const cell = Math.max(1, pixelSize * dpr);
      const columns = Math.ceil(canvasWidth / cell);
      const rows = Math.ceil(canvasHeight / cell);
      const output = new ImageData(columns, rows);
      const alpha = Math.round(opacity * 255);

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const [u, v] = containerToImageUv(
            ((column + 0.5) * cell) / canvasWidth,
            ((row + 0.5) * cell) / canvasHeight,
            frame,
            canvasWidth,
            canvasHeight,
            source.width,
            source.height,
          );
          const sx = Math.min(
            source.width - 1,
            Math.max(0, Math.floor(u * source.width)),
          );
          const sy = Math.min(
            source.height - 1,
            Math.max(0, Math.floor(v * source.height)),
          );
          const index = (sy * source.width + sx) * 4;
          const luma =
            (0.2126 * source.data[index] +
              0.7152 * source.data[index + 1] +
              0.0722 * source.data[index + 2]) /
            255;
          const t = Math.min(
            1,
            Math.max(0, luma + (hash2d(column, row) - 0.5) * scatter - offset),
          );
          const threshold =
            thresholds[(row % BAYER_SIZE) * BAYER_SIZE + (column % BAYER_SIZE)];
          const [r, g, b] = ditherPalette(resolved, t, threshold);
          const out = (row * columns + column) * 4;
          output.data[out] = r * 255;
          output.data[out + 1] = g * 255;
          output.data[out + 2] = b * 255;
          output.data[out + 3] = alpha;
        }
      }

      const cells = document.createElement("canvas");
      cells.width = columns;
      cells.height = rows;
      cells.getContext("2d")?.putImageData(output, 0, 0);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      context.imageSmoothingEnabled = false;
      context.drawImage(cells, 0, 0, columns * cell, rows * cell);
    };

    const scheduleDraw = () => {
      cancelAnimationFrame(frameRequest);
      frameRequest = requestAnimationFrame(draw);
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (cancelled) return;
      const reader = document.createElement("canvas");
      reader.width = image.naturalWidth;
      reader.height = image.naturalHeight;
      const readerContext = reader.getContext("2d", {
        willReadFrequently: true,
      });
      if (!readerContext) return;
      readerContext.drawImage(image, 0, 0);
      source = readerContext.getImageData(0, 0, reader.width, reader.height);
      draw();
    };
    image.src = src;

    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRequest);
      resizeObserver.disconnect();
    };
  }, [src, palette, pixelSize, opacity, offset, scatter, frame]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
  );
}
