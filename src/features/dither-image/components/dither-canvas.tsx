"use client";

import { useRef } from "react";
import { useDitherAnimation } from "@/features/dither-image/hooks/use-dither-animation";
import { useDitherScene } from "@/features/dither-image/hooks/use-dither-scene";
import type {
  DitherAnimation,
  DitherFrame,
  DitherPalette,
  DitherQuantize,
} from "@/features/dither-image/types";

type DitherCanvasProps = {
  src: string;
  palette: DitherPalette;
  pixelSize: number;
  opacity: number;
  offset: number;
  scatter: number;
  quantize: DitherQuantize;
  levels: number;
  frame: DitherFrame;
  animation: DitherAnimation;
};

export function DitherCanvas({
  animation,
  ...sceneOptions
}: DitherCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { uniformsRef, ready } = useDitherScene(containerRef, {
    ...sceneOptions,
    continuous: animation !== "none",
  });

  useDitherAnimation(containerRef, uniformsRef, ready, animation);

  return <div ref={containerRef} className="absolute inset-0" />;
}
