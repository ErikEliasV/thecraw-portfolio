import { BAYER_SIZE } from "@/features/dither-image/utils/bayer";
import { MAX_PALETTE_STOPS } from "@/features/dither-image/utils/palette";

/**
 * Reproduces the Figma effect stack, then keeps it alive:
 * 1. Gradient map: luminance (texture read as linear, converted to sRGB, like
 *    Figma) + scatter + offset -> position on the palette ramp.
 * 2. Quantization: per-channel Bayer 16x16 ("Dither") or flat ("Pixelate").
 * Constant motion: a drifting flow field distorts the image, light waves sweep
 * the tones, the Bayer pattern crawls and the scatter grain is re-seeded.
 * Output is premultiplied alpha.
 */
export const DITHER_FRAGMENT_SHADER = /* glsl */ `
  #define MAX_STOPS ${MAX_PALETTE_STOPS}
  #define BAYER_SIZE ${BAYER_SIZE}.0

  uniform sampler2D uImage;
  uniform sampler2D uBayer;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform vec4 uFrame;

  uniform vec3 uColors[MAX_STOPS];
  uniform float uStops[MAX_STOPS];
  uniform int uStopCount;

  uniform float uPixelSize;
  uniform float uOpacity;
  uniform float uOffset;
  uniform float uScatter;
  uniform int uQuantize;
  uniform float uLevels;

  uniform float uTime;
  uniform float uFlow;
  uniform float uWave;
  uniform float uLive;
  uniform float uReveal;
  uniform float uEntryCoarse;
  uniform float uScrollCoarse;
  uniform float uDensity;

  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uMouseRadius;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amplitude * valueNoise(p);
      p = p * 2.03 + 17.0;
      amplitude *= 0.5;
    }
    return value / 0.875;
  }

  float toSrgb(float c) {
    return c <= 0.0031308 ? c * 12.92 : 1.055 * pow(c, 1.0 / 2.4) - 0.055;
  }

  float figmaLuma(vec3 c) {
    return dot(vec3(toSrgb(c.r), toSrgb(c.g), toSrgb(c.b)), vec3(0.2126, 0.7152, 0.0722));
  }

  // Container UV -> image UV, the image covering the frame rectangle.
  vec2 frameUv(vec2 uv) {
    vec2 local = (uv - uFrame.xy) / uFrame.zw;
    vec2 frameSize = uFrame.zw * uResolution;
    float frameRatio = frameSize.x / frameSize.y;
    float imageRatio = uImageSize.x / uImageSize.y;
    vec2 scale = frameRatio > imageRatio
      ? vec2(1.0, imageRatio / frameRatio)
      : vec2(frameRatio / imageRatio, 1.0);
    return (local - 0.5) * scale + 0.5;
  }

  vec3 gradientMap(float t) {
    if (t <= uStops[0]) return uColors[0];
    for (int i = 0; i < MAX_STOPS - 1; i++) {
      if (i >= uStopCount - 1) break;
      float start = uStops[i];
      float end = uStops[i + 1];
      if (t <= end) {
        return mix(uColors[i], uColors[i + 1], (t - start) / max(end - start, 1e-5));
      }
    }
    return uColors[uStopCount - 1];
  }

  float bayer(vec2 cell) {
    return texture2D(uBayer, (mod(cell, BAYER_SIZE) + 0.5) / BAYER_SIZE).r;
  }

  void main() {
    vec2 fragPx = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
    vec2 screenUv = fragPx / uResolution;
    float aspect = uResolution.x / uResolution.y;

    vec2 toMouse = (screenUv - uMouse) * vec2(aspect, 1.0);
    float hover = uMouseStrength * smoothstep(uMouseRadius, 0.0, length(toMouse));

    // Whole-pixel cells in discrete hover steps keep the grid crisp (no rings).
    float hoverScale = floor(1.0 + hover * 3.0 + 0.5);
    float pixel = max(1.0, floor(uPixelSize * uEntryCoarse * uScrollCoarse * hoverScale + 0.5));
    vec2 cell = floor(fragPx / pixel);
    vec2 cellUv = (cell + 0.5) * pixel / uResolution;

    // Flow: the whole image drifts and breathes.
    vec2 flowPoint = cellUv * vec2(aspect, 1.0) * 2.2;
    vec2 flow = vec2(
      fbm(flowPoint + vec2(uTime * 0.06, uTime * 0.02)),
      fbm(flowPoint + vec2(5.2, 1.3) - vec2(uTime * 0.03, uTime * 0.05))
    ) - 0.5;
    vec2 sampleUv = cellUv + flow * uFlow * vec2(1.0 / aspect, 1.0);

    vec3 source = texture2D(uImage, clamp(frameUv(sampleUv), 0.0, 1.0)).rgb;
    float luma = figmaLuma(source);

    // Scatter grain, re-seeded a dozen times a second.
    float grainFrame = floor(uTime * 12.0) * uLive;
    float scatter = (hash(cell + grainFrame * 37.0) - 0.5) * uScatter;
    // Light waves sweeping across the tones.
    float wave = (fbm(cellUv * vec2(aspect, 1.0) * 1.3 + vec2(uTime * 0.08, -uTime * 0.05)) - 0.5) * uWave;

    float t = clamp(luma + scatter + wave - uOffset + uDensity - hover * 0.12, 0.0, 1.0);
    vec3 color = gradientMap(t);

    if (uQuantize > 0) {
      float steps = uLevels - 1.0;
      // The ordered pattern crawls diagonally, one cell every 125ms.
      float threshold = bayer(cell + floor(uTime * 8.0) * uLive);
      vec3 biased = uQuantize == 1 ? color + (threshold - 0.5) / steps : color;
      color = clamp(floor(biased * steps + 0.5) / steps, 0.0, 1.0);
    }

    // Cells materialize in Bayer order as uReveal rises.
    float alpha = uOpacity * step(bayer(cell), uReveal);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;
