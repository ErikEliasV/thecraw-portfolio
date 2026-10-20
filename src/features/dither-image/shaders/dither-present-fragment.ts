import { BAYER_SIZE } from "@/features/dither-image/utils/bayer";

/**
 * Present pass, every frame: shows the baked Figma look and animates it with
 * its own pixels only. On their own random clocks, pixels switch between the
 * baked variants of the effect and trade places with neighbours (singly or in
 * small blocks). No color outside the effect is ever produced. Entry, scroll
 * and cursor coarsen cells by sampling the bake once per cell.
 */
export const DITHER_PRESENT_FRAGMENT_SHADER = /* glsl */ `
  #define BAYER_SIZE ${BAYER_SIZE}.0

  uniform sampler2D uBake0;
  uniform sampler2D uBake1;
  uniform sampler2D uBake2;
  uniform sampler2D uBayer;
  uniform vec2 uResolution;

  uniform float uOpacity;
  uniform float uTime;
  uniform float uLive;
  uniform float uBoil;
  uniform float uSwap;
  uniform float uBlockSwap;
  uniform float uBlock;
  uniform float uReveal;
  uniform float uEntryCoarse;
  uniform float uScrollCoarse;

  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uMouseRadius;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float bayer(vec2 cell) {
    return texture2D(uBayer, (mod(cell, BAYER_SIZE) + 0.5) / BAYER_SIZE).r;
  }

  vec2 bakeUv(vec2 px) {
    vec2 uv = px / uResolution;
    return vec2(uv.x, 1.0 - uv.y);
  }

  void main() {
    vec2 fragPx = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
    vec2 toMouse = (fragPx / uResolution - uMouse) * vec2(uResolution.x / uResolution.y, 1.0);
    float hover = uMouseStrength * smoothstep(uMouseRadius, 0.0, length(toMouse));
    float coarse = max(1.0, floor(uEntryCoarse * uScrollCoarse * floor(1.0 + hover * 3.0 + 0.5) + 0.5));

    // Small blocks trade places with a nearby block.
    vec2 block = floor(fragPx / uBlock);
    float blockTick = floor(uTime * 12.0 + hash(block * 1.31 + 7.0) * 12.0) * uLive;
    float blockMoves = step(1.0 - uBlockSwap, hash(block + blockTick * 1.618)) * uLive;
    vec2 blockJump = floor((vec2(hash(block + blockTick * 3.7), hash(block.yx + blockTick * 5.3)) - 0.5) * 6.0 + 0.5);
    vec2 px = fragPx + blockJump * uBlock * blockMoves;

    // Single pixels trade places with a neighbour.
    vec2 pixel = floor(px);
    float pixelTick = floor(uTime * 12.0 + hash(pixel * 0.37) * 12.0) * uLive;
    float pixelMoves = step(1.0 - uSwap, hash(pixel + pixelTick * 1.37)) * uLive;
    vec2 nudge = floor((vec2(hash(pixel + pixelTick * 2.1), hash(pixel.yx + pixelTick * 3.3)) - 0.5) * 5.0 + 0.5);
    px += nudge * pixelMoves;

    // Coarse cells sample the bake once per cell.
    vec2 samplePx = (floor(px / coarse) + 0.5) * coarse;
    vec2 uv = bakeUv(samplePx);

    // Each pixel flickers between the baked variants of the effect.
    float roll = hash(floor(samplePx) + pixelTick * 4.13) * step(0.5, uLive);
    vec3 color = texture2D(uBake0, uv).rgb;
    if (roll > 1.0 - uBoil) {
      color = roll > 1.0 - uBoil * 0.5 ? texture2D(uBake2, uv).rgb : texture2D(uBake1, uv).rgb;
    }

    // Cells materialize in Bayer order as uReveal rises.
    float alpha = uOpacity * step(bayer(floor(fragPx / coarse)), uReveal);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;
