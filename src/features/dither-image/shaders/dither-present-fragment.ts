import { BAYER_SIZE } from "@/features/dither-image/utils/bayer";

/**
 * Present pass, every frame: shows the baked Figma look and animates it with
 * the effect's own pixels.
 * - Wind: gusts drift to the right and blow dither cells along with them; in
 *   calm air a few cells still hop. Cells flicker between baked variants.
 * - Coarse cells (entry, scroll, cursor lens) enlarge the effect's own pixels:
 *   the bake is sampled once per bigger cell, so no new color appears.
 * Premultiplied output.
 */
export const DITHER_PRESENT_FRAGMENT_SHADER = /* glsl */ `
  #define BAYER_SIZE ${BAYER_SIZE}.0

  uniform sampler2D uBake0;
  uniform sampler2D uBake1;
  uniform sampler2D uBake2;
  uniform sampler2D uBayer;
  uniform vec2 uResolution;
  uniform float uCell;

  uniform float uOpacity;
  uniform float uTime;
  uniform float uLive;
  uniform float uBoil;
  uniform float uSwap;
  uniform float uWindSpeed;
  uniform float uWindStrength;
  uniform float uWindScale;
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

  float bayer(vec2 cell) {
    return texture2D(uBayer, (mod(cell, BAYER_SIZE) + 0.5) / BAYER_SIZE).r;
  }

  vec2 bakeUv(vec2 px) {
    vec2 uv = clamp(px / uResolution, 0.0, 1.0);
    return vec2(uv.x, 1.0 - uv.y);
  }

  void main() {
    vec2 fragPx = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
    vec2 screenUv = fragPx / uResolution;
    float aspect = uResolution.x / uResolution.y;

    vec2 toMouse = (screenUv - uMouse) * vec2(aspect, 1.0);
    float hover = uMouseStrength * smoothstep(uMouseRadius, 0.0, length(toMouse));

    // Wind: gusts travel right; inside them cells are blown right.
    vec2 cell = floor(fragPx / uCell);
    float gust = valueNoise(vec2(
      screenUv.x * uWindScale * aspect - uTime * uWindSpeed,
      screenUv.y * uWindScale * 3.0
    ));
    gust = smoothstep(0.35, 0.85, gust) * uLive;
    float tick = floor(uTime * 14.0 + hash(cell * 0.37) * 14.0) * uLive;
    float blown = floor(gust * hash(cell + tick * 1.37) * uWindStrength + 0.5);
    float hops = step(1.0 - uSwap, hash(cell + tick * 2.9)) * uLive;
    blown += hops * floor(hash(cell + tick * 4.1) * 3.0 + 1.0);
    vec2 px = fragPx - vec2(blown * uCell, 0.0);

    float coarse = uEntryCoarse * uScrollCoarse * floor(1.0 + hover * 3.0 + 0.5);
    float size = max(uCell, floor(uCell * coarse + 0.5));
    vec2 sampleCell = floor(px / size);
    vec2 uv = bakeUv((sampleCell + 0.5) * size);

    // Each cell flickers between the baked variants of the effect.
    float roll = hash(sampleCell + tick * 4.13) * step(0.5, uLive);
    float boil = uBoil + gust * 0.35;
    vec3 color = texture2D(uBake0, uv).rgb;
    if (roll > 1.0 - boil) {
      color = roll > 1.0 - boil * 0.5 ? texture2D(uBake2, uv).rgb : texture2D(uBake1, uv).rgb;
    }

    // Cells materialize in Bayer order as uReveal rises.
    float alpha = uOpacity * step(bayer(floor(fragPx / size)), uReveal);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;
