"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { DITHER_FRAGMENT_SHADER } from "@/features/dither-image/shaders/dither-fragment";
import { DITHER_VERTEX_SHADER } from "@/features/dither-image/shaders/dither-vertex";
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
  MAX_PALETTE_STOPS,
  resolvePalette,
} from "@/features/dither-image/utils/palette";
import { gsap } from "@/lib/gsap";

const MAX_DPR = 2;
const QUANTIZE_MODE: Record<DitherQuantize, number> = {
  none: 0,
  ordered: 1,
  posterize: 2,
};
/** Constant motion: flow-field distortion and tonal wave amplitudes. */
const MOTION = { flow: 0.014, wave: 0.1 };

export type DitherUniforms = {
  uImage: THREE.IUniform<THREE.Texture | null>;
  uBayer: THREE.IUniform<THREE.DataTexture>;
  uResolution: THREE.IUniform<THREE.Vector2>;
  uImageSize: THREE.IUniform<THREE.Vector2>;
  uFrame: THREE.IUniform<THREE.Vector4>;
  uColors: THREE.IUniform<THREE.Vector3[]>;
  uStops: THREE.IUniform<number[]>;
  uStopCount: THREE.IUniform<number>;
  uPixelSize: THREE.IUniform<number>;
  uOpacity: THREE.IUniform<number>;
  uOffset: THREE.IUniform<number>;
  uScatter: THREE.IUniform<number>;
  uQuantize: THREE.IUniform<number>;
  uLevels: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  uFlow: THREE.IUniform<number>;
  uWave: THREE.IUniform<number>;
  uLive: THREE.IUniform<number>;
  uReveal: THREE.IUniform<number>;
  uEntryCoarse: THREE.IUniform<number>;
  uScrollCoarse: THREE.IUniform<number>;
  uDensity: THREE.IUniform<number>;
  uMouse: THREE.IUniform<THREE.Vector2>;
  uMouseStrength: THREE.IUniform<number>;
  uMouseRadius: THREE.IUniform<number>;
};

type DitherSceneOptions = {
  src: string;
  palette: DitherPalette;
  pixelSize: number;
  opacity: number;
  offset: number;
  scatter: number;
  quantize: DitherQuantize;
  levels: number;
  frame: DitherFrame;
  /** Render every frame while visible (animated) or only on demand. */
  continuous: boolean;
};

function createBayerTexture() {
  const texture = new THREE.DataTexture(
    createBayerThresholds(),
    BAYER_SIZE,
    BAYER_SIZE,
    THREE.RedFormat,
    THREE.FloatType,
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Owns the Three.js renderer for one dither image: texture loading, resize,
 * DPR cap, render loop paused off-screen, and full disposal on unmount.
 * A fresh canvas is created per mount, so a lost context is never reused.
 */
export function useDitherScene(
  containerRef: RefObject<HTMLDivElement | null>,
  {
    src,
    palette,
    pixelSize,
    opacity,
    offset,
    scatter,
    quantize,
    levels,
    frame,
    continuous,
  }: DitherSceneOptions,
) {
  const uniformsRef = useRef<DitherUniforms | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    container.appendChild(canvas);

    let disposed = false;
    let visible = false;
    let loaded = false;
    let imageTexture: THREE.Texture | null = null;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const bayerTexture = createBayerTexture();
    const resolved = resolvePalette(palette);
    const colors = Array.from(
      { length: MAX_PALETTE_STOPS },
      (_, i) => new THREE.Vector3(...(resolved.colors[i] ?? [0, 0, 0])),
    );
    const stops = Array.from(
      { length: MAX_PALETTE_STOPS },
      (_, i) => resolved.positions[i] ?? 1,
    );

    const uniforms: DitherUniforms = {
      uImage: { value: null },
      uBayer: { value: bayerTexture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uFrame: {
        value: new THREE.Vector4(frame.x, frame.y, frame.width, frame.height),
      },
      uColors: { value: colors },
      uStops: { value: stops },
      uStopCount: { value: resolved.colors.length },
      uPixelSize: { value: pixelSize },
      uOpacity: { value: opacity },
      uOffset: { value: offset },
      uScatter: { value: scatter },
      uQuantize: { value: QUANTIZE_MODE[quantize] },
      uLevels: { value: levels },
      uTime: { value: 0 },
      uFlow: { value: continuous ? MOTION.flow : 0 },
      uWave: { value: continuous ? MOTION.wave : 0 },
      uLive: { value: continuous ? 1 : 0 },
      uReveal: { value: continuous ? 0 : 1 },
      uEntryCoarse: { value: 1 },
      uScrollCoarse: { value: 1 },
      uDensity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
      uMouseRadius: { value: 0.22 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: DITHER_VERTEX_SHADER,
      fragmentShader: DITHER_FRAGMENT_SHADER,
      uniforms,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(geometry, material));

    const render = () => {
      if (loaded) renderer.render(scene, camera);
    };

    const tick = (_time: number, deltaTime: number) => {
      uniforms.uTime.value += deltaTime / 1000;
      render();
    };

    const updateLoop = () => {
      gsap.ticker.remove(tick);
      if (continuous && visible && loaded && !disposed) gsap.ticker.add(tick);
    };

    const drawingBuffer = new THREE.Vector2();
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.getDrawingBufferSize(drawingBuffer);
      uniforms.uResolution.value.copy(drawingBuffer);
      uniforms.uPixelSize.value = pixelSize * renderer.getPixelRatio();
      render();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateLoop();
    });
    intersectionObserver.observe(container);

    new THREE.TextureLoader()
      .loadAsync(src)
      .then((texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        // Raw values: the shader converts them like Figma does.
        texture.colorSpace = THREE.NoColorSpace;
        // UVs use a top-left origin, like the CSS layout.
        texture.flipY = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        const image = texture.image as { width: number; height: number };
        uniforms.uImage.value = texture;
        uniforms.uImageSize.value.set(image.width, image.height);
        imageTexture = texture;
        loaded = true;
        uniformsRef.current = uniforms;
        updateLoop();
        render();
        setReady(true);
      })
      .catch(() => {
        // Leave the container background visible if the image fails.
      });

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      uniformsRef.current = null;
      geometry.dispose();
      material.dispose();
      bayerTexture.dispose();
      imageTexture?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      setReady(false);
    };
  }, [
    containerRef,
    src,
    palette,
    pixelSize,
    opacity,
    offset,
    scatter,
    quantize,
    levels,
    frame,
    continuous,
  ]);

  return { uniformsRef, ready };
}
