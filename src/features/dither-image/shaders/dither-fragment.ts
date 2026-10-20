import { BAYER_SIZE } from "@/features/dither-image/utils/bayer";
import { MAX_PALETTE_STOPS } from "@/features/dither-image/utils/palette";

/**
 * Gradient map + ordered dither, as authored in Figma:
 * luminance -> position on the palette -> Bayer threshold picks one of the
 * two neighbouring palette colors. Output is premultiplied alpha.
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

  uniform float uTime;
  uniform float uShimmer;
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

  vec3 ditherPalette(float t, float threshold) {
    if (t <= uStops[0]) return uColors[0];
    for (int i = 0; i < MAX_STOPS - 1; i++) {
      if (i >= uStopCount - 1) break;
      float start = uStops[i];
      float end = uStops[i + 1];
      if (t <= end) {
        float fraction = (t - start) / max(end - start, 1e-5);
        return fraction > threshold ? uColors[i + 1] : uColors[i];
      }
    }
    return uColors[uStopCount - 1];
  }

  void main() {
    vec2 fragPx = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
    vec2 screenUv = fragPx / uResolution;

    vec2 toMouse = (screenUv - uMouse) * vec2(uResolution.x / uResolution.y, 1.0);
    float hover = uMouseStrength * smoothstep(uMouseRadius, 0.0, length(toMouse));

    float pixel = max(1.0, uPixelSize * uEntryCoarse * uScrollCoarse * (1.0 + hover * 3.0));
    vec2 cell = floor(fragPx / pixel);
    vec2 cellUv = (cell + 0.5) * pixel / uResolution;

    vec3 source = texture2D(uImage, clamp(frameUv(cellUv), 0.0, 1.0)).rgb;
    float luma = dot(source, vec3(0.2126, 0.7152, 0.0722));

    float scatter = (hash(cell) - 0.5) * uScatter;
    float shimmer = (valueNoise(cell * 0.015 + vec2(uTime * 0.12, uTime * 0.07)) - 0.5) * uShimmer;
    float t = clamp(luma + scatter + shimmer - uOffset + uDensity - hover * 0.12, 0.0, 1.0);

    float threshold = texture2D(uBayer, (mod(cell, BAYER_SIZE) + 0.5) / BAYER_SIZE).r;
    vec3 color = ditherPalette(t, threshold);

    // Cells materialize in Bayer order as uReveal rises.
    float alpha = uOpacity * step(threshold, uReveal);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;
