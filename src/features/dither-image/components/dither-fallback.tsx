"use client";

import { useEffect, useRef } from "react";
import type {
  DitherFrame,
  DitherPalette,
  DitherQuantize,
} from "@/features/dither-image/types";
import {
  BAYER_SIZE,
  createBayerThresholds,
} from "@/features/dither-image/utils/bayer";
import {
  FIGMA_RENDER_SCALE,
  figmaLuma,
  quantizeChannel,
  SUBSAMPLES_AT_1X,
} from "@/features/dither-image/utils/color";
import { containerToImageUv } from "@/features/dither-image/utils/frame";
import { hash2d } from "@/features/dither-image/utils/hash";
import {
  gradientMap,
  resolvePalette,
} from "@/features/dither-image/utils/palette";

type DitherFallbackProps = {
  src: string;
  palette: DitherPalette;
  pixelSize: number;
  opacity: number;
  offset: number;
  scatter: number;
  quantize: DitherQuantize;
  levels: number;
  frame: DitherFrame;
};

const MAX_DPR = 2;

/**
 * Static render on a 2D canvas (no WebGL, or reduced motion): the same Figma
 * gradient map and quantization as the shader, without motion.
 */
export function DitherFallback({
  src,
  palette,
  pixelSize,
  opacity,
  offset,
  scatter,
  quantize,
  levels,
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
      const rawCell = (pixelSize * dpr) / FIGMA_RENDER_SCALE;
      const cell = rawCell >= 1 ? Math.round(rawCell) : rawCell;
      const subsamples =
        quantize === "ordered"
          ? Math.max(1, Math.round(SUBSAMPLES_AT_1X / dpr))
          : 1;
      const output = new ImageData(canvasWidth, canvasHeight);
      const alpha = Math.round(opacity * 255);
      const sampleCell = Math.max(cell, 1);

      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          // Same as the shader: gradient map once per pixel (or coarse cell).
          const cellX = Math.floor(x / sampleCell);
          const cellY = Math.floor(y / sampleCell);
          const [u, v] = containerToImageUv(
            ((cellX + 0.5) * sampleCell) / canvasWidth,
            ((cellY + 0.5) * sampleCell) / canvasHeight,
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
          const luma = figmaLuma(
            source.data[index] / 255,
            source.data[index + 1] / 255,
            source.data[index + 2] / 255,
          );
          const t = Math.min(
            1,
            Math.max(0, luma + (hash2d(cellX, cellY) - 0.5) * scatter - offset),
          );
          const mapped = gradientMap(resolved, t);
          const sum = [0, 0, 0];

          for (let j = 0; j < subsamples; j++) {
            for (let i = 0; i < subsamples; i++) {
              const subX = Math.floor((x + (i + 0.5) / subsamples) / cell);
              const subY = Math.floor((y + (j + 0.5) / subsamples) / cell);
              const threshold =
                thresholds[
                  (subY % BAYER_SIZE) * BAYER_SIZE + (subX % BAYER_SIZE)
                ];
              for (let channel = 0; channel < 3; channel++) {
                sum[channel] += quantizeChannel(
                  mapped[channel],
                  quantize,
                  levels,
                  threshold,
                );
              }
            }
          }

          const out = (y * canvasWidth + x) * 4;
          const count = subsamples * subsamples;
          output.data[out] = (sum[0] / count) * 255;
          output.data[out + 1] = (sum[1] / count) * 255;
          output.data[out + 2] = (sum[2] / count) * 255;
          output.data[out + 3] = alpha;
        }
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      context.putImageData(output, 0, 0);
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
  }, [
    src,
    palette,
    pixelSize,
    opacity,
    offset,
    scatter,
    quantize,
    levels,
    frame,
  ]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
  );
}
