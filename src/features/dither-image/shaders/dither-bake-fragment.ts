import { BAYER_SIZE } from "@/features/dither-image/utils/bayer";
import { MAX_PALETTE_STOPS } from "@/features/dither-image/utils/palette";

/**
 * Bake pass: the static Figma look, rendered once per size into a texture.
 * Several variants are baked (shifted Bayer phase, new scatter seed): the same
 * effect, so animating between them never introduces new colors.
 * 1. Gradient map: luminance (texture read as linear, converted to sRGB, like
 *    Figma) + scatter + offset -> position on the palette ramp.
 * 2. Quantization: per-channel Bayer 16x16 ("Dither") or flat ("Pixelate").
 *    Figma rasterizes effects at 1.25x and downsamples; ordered dithering is
 *    supersampled per pixel to match that texture.
 */
export const DITHER_BAKE_FRAGMENT_SHADER = /* glsl */ `
  #define MAX_STOPS ${MAX_PALETTE_STOPS}
  #define BAYER_SIZE ${BAYER_SIZE}.0
  #define MAX_SUBSAMPLES 4

  uniform sampler2D uImage;
  uniform sampler2D uBayer;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform vec4 uFrame;

  uniform vec3 uColors[MAX_STOPS];
  uniform float uStops[MAX_STOPS];
  uniform int uStopCount;

  uniform float uPixelSize;
  uniform float uSubsamples;
  uniform float uOffset;
  uniform float uScatter;
  uniform float uSeed;
  uniform vec2 uPhase;
  uniform int uQuantize;
  uniform float uLevels;
  // 1.0: write the palette position (t) instead of the color.
  uniform float uOutputT;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
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
    vec2 px = floor(vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y));

    // Gradient map once per pixel, or once per cell for coarse cells.
    float sampleCell = max(uPixelSize, 1.0);
    vec2 cell = floor(px / sampleCell);
    vec3 source = texture2D(uImage, clamp(frameUv((cell + 0.5) * sampleCell / uResolution), 0.0, 1.0)).rgb;
    float scatter = (hash(cell + uSeed * 37.0) - 0.5) * uScatter;
    float t = clamp(figmaLuma(source) + scatter - uOffset, 0.0, 1.0);
    if (uOutputT > 0.5) {
      gl_FragColor = vec4(t, 0.0, 0.0, 1.0);
      return;
    }
    vec3 color = gradientMap(t);

    float steps = uLevels - 1.0;
    if (uQuantize == 2) {
      color = floor(color * steps + 0.5) / steps;
    } else if (uQuantize == 1) {
      vec3 sum = vec3(0.0);
      for (int j = 0; j < MAX_SUBSAMPLES; j++) {
        if (float(j) >= uSubsamples) break;
        for (int i = 0; i < MAX_SUBSAMPLES; i++) {
          if (float(i) >= uSubsamples) break;
          vec2 sub = px + (vec2(float(i), float(j)) + 0.5) / uSubsamples;
          float threshold = bayer(floor(sub / uPixelSize) + uPhase);
          sum += clamp(floor((color + (threshold - 0.5) / steps) * steps + 0.5) / steps, 0.0, 1.0);
        }
      }
      color = sum / (uSubsamples * uSubsamples);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
