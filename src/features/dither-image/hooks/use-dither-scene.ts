"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { DITHER_BAKE_FRAGMENT_SHADER } from "@/features/dither-image/shaders/dither-bake-fragment";
import { DITHER_PRESENT_FRAGMENT_SHADER } from "@/features/dither-image/shaders/dither-present-fragment";
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
import { ditherCellSize } from "@/features/dither-image/utils/color";
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
/**
 * Motion with the effect's own pixels: share of cells showing another baked
 * variant, cells hopping in calm air, and the wind (gust drift speed, max cells
 * blown to the right, gust scale).
 */
const MOTION = {
  boil: 0.12,
  swap: 0.03,
  windSpeed: 0.9,
  windStrength: 6,
  windScale: 2.5,
};
/** Bayer phase (in cells) of each baked variant; variant 0 is the Figma one. */
const VARIANT_PHASES = [
  [0, 0],
  [7, 3],
  [3, 11],
] as const;
/** The motion re-renders this many times per second when nothing else moves. */
const TICKS_PER_SECOND = 24;

/** Uniforms driven by GSAP (entry, scroll, cursor). */
export type DitherUniforms = {
  uReveal: THREE.IUniform<number>;
  uEntryCoarse: THREE.IUniform<number>;
  uScrollCoarse: THREE.IUniform<number>;
  uMouse: THREE.IUniform<THREE.Vector2>;
  uMouseStrength: THREE.IUniform<number>;
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
  /** Keep the image moving while visible, or render it once. */
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

function createBakeTarget() {
  return new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    generateMipmaps: false,
  });
}

/**
 * Owns the Three.js renderer for one dither image. The Figma look is baked
 * once per size (bake pass); every frame a light pass animates it. Handles
 * texture loading, resize, DPR cap, pausing off-screen and full disposal.
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

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const bayerTexture = createBayerTexture();
    const resolved = resolvePalette(palette);
    const toVector = (rgb: readonly number[] | undefined) =>
      new THREE.Vector3(...(rgb ?? [0, 0, 0]));
    const resolution = new THREE.Vector2(1, 1);
    const bakeTargets = VARIANT_PHASES.map(() => createBakeTarget());
    const paletteColors = Array.from({ length: MAX_PALETTE_STOPS }, (_, i) =>
      toVector(resolved.colors[i]),
    );
    const paletteStops = Array.from(
      { length: MAX_PALETTE_STOPS },
      (_, i) => resolved.positions[i] ?? 1,
    );

    const bakeMaterial = new THREE.ShaderMaterial({
      vertexShader: DITHER_VERTEX_SHADER,
      fragmentShader: DITHER_BAKE_FRAGMENT_SHADER,
      uniforms: {
        uImage: { value: null },
        uBayer: { value: bayerTexture },
        uResolution: { value: resolution },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uFrame: {
          value: new THREE.Vector4(frame.x, frame.y, frame.width, frame.height),
        },
        uColors: { value: paletteColors },
        uStops: { value: paletteStops },
        uStopCount: { value: resolved.colors.length },
        uPixelSize: { value: 1 },
        uSubsamples: { value: 1 },
        uOffset: { value: offset },
        uScatter: { value: scatter },
        uSeed: { value: 0 },
        uPhase: { value: new THREE.Vector2() },
        uQuantize: { value: QUANTIZE_MODE[quantize] },
        uLevels: { value: levels },
      },
      depthTest: false,
      depthWrite: false,
    });

    const animated: DitherUniforms = {
      uReveal: { value: continuous ? 0 : 1 },
      uEntryCoarse: { value: 1 },
      uScrollCoarse: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
    };
    const presentMaterial = new THREE.ShaderMaterial({
      vertexShader: DITHER_VERTEX_SHADER,
      fragmentShader: DITHER_PRESENT_FRAGMENT_SHADER,
      uniforms: {
        ...animated,
        uBake0: { value: bakeTargets[0].texture },
        uBake1: { value: bakeTargets[1].texture },
        uBake2: { value: bakeTargets[2].texture },
        uBayer: { value: bayerTexture },
        uResolution: { value: resolution },
        uCell: { value: 1 },
        uOpacity: { value: opacity },
        uTime: { value: 0 },
        uLive: { value: continuous ? 1 : 0 },
        uBoil: { value: MOTION.boil },
        uSwap: { value: MOTION.swap },
        uWindSpeed: { value: MOTION.windSpeed },
        uWindStrength: { value: MOTION.windStrength },
        uWindScale: { value: MOTION.windScale },
        uMouseRadius: { value: 0.22 },
      },
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });

    const bakeScene = new THREE.Scene();
    bakeScene.add(new THREE.Mesh(geometry, bakeMaterial));
    const presentScene = new THREE.Scene();
    presentScene.add(new THREE.Mesh(geometry, presentMaterial));

    const bake = () => {
      const uniforms = bakeMaterial.uniforms;
      bakeTargets.forEach((target, index) => {
        uniforms.uSeed.value = index;
        uniforms.uPhase.value.set(...VARIANT_PHASES[index]);
        renderer.setRenderTarget(target);
        renderer.render(bakeScene, camera);
      });
      renderer.setRenderTarget(null);
    };

    const present = () => {
      if (loaded) renderer.render(presentScene, camera);
    };

    // Re-render only when the random motion re-rolls or a GSAP uniform moved.
    let lastTick = -1;
    let lastState = "";
    const tick = (_time: number, deltaTime: number) => {
      const time = (presentMaterial.uniforms.uTime.value += deltaTime / 1000);
      const motionTick = Math.floor(time * TICKS_PER_SECOND);
      const state = [
        animated.uReveal.value,
        animated.uEntryCoarse.value,
        animated.uScrollCoarse.value,
        animated.uMouse.value.x,
        animated.uMouse.value.y,
        animated.uMouseStrength.value,
      ].join();
      if (motionTick === lastTick && state === lastState) return;
      lastTick = motionTick;
      lastState = state;
      present();
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
      resolution.copy(drawingBuffer);
      bakeTargets.forEach((target) =>
        target.setSize(drawingBuffer.x, drawingBuffer.y),
      );

      const { cell, subsamples } = ditherCellSize(
        pixelSize,
        renderer.getPixelRatio(),
      );
      bakeMaterial.uniforms.uPixelSize.value = cell;
      bakeMaterial.uniforms.uSubsamples.value = subsamples;
      presentMaterial.uniforms.uCell.value = Math.max(cell, 1);
      if (loaded) {
        bake();
        present();
      }
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
        // Raw values: the bake shader converts them like Figma does.
        texture.colorSpace = THREE.NoColorSpace;
        // UVs use a top-left origin, like the CSS layout.
        texture.flipY = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        const image = texture.image as { width: number; height: number };
        bakeMaterial.uniforms.uImage.value = texture;
        bakeMaterial.uniforms.uImageSize.value.set(image.width, image.height);
        imageTexture = texture;
        loaded = true;
        uniformsRef.current = animated;
        bake();
        present();
        updateLoop();
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
      bakeMaterial.dispose();
      presentMaterial.dispose();
      bakeTargets.forEach((target) => target.dispose());
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
