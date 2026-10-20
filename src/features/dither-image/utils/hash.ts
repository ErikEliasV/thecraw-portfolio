const fract = (value: number) => value - Math.floor(value);

/** Per-cell pseudo-random value in [0, 1). Mirrors `hash` in the shader. */
export function hash2d(x: number, y: number): number {
  let p1 = fract(x * 0.1031);
  let p2 = fract(y * 0.1031);
  let p3 = fract(x * 0.1031);
  const dot = p1 * (p2 + 33.33) + p2 * (p3 + 33.33) + p3 * (p1 + 33.33);
  p1 += dot;
  p2 += dot;
  p3 += dot;
  return fract((p1 + p2) * p3);
}
