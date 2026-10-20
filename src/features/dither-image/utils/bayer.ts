export const BAYER_SIZE = 16;

function bayerMatrix(size: number): number[][] {
  if (size === 1) return [[0]];
  const half = size / 2;
  const smaller = bayerMatrix(half);

  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const quadrantX = Math.floor(x / half);
      const quadrantY = Math.floor(y / half);
      const quadrantOffset =
        quadrantY === 0 ? (quadrantX === 0 ? 0 : 2) : quadrantX === 0 ? 3 : 1;
      return smaller[y % half][x % half] * 4 + quadrantOffset;
    }),
  );
}

/** Row-major ordered-dither thresholds in (0, 1). */
export function createBayerThresholds(size = BAYER_SIZE): Float32Array {
  const matrix = bayerMatrix(size);
  const thresholds = new Float32Array(size * size);
  const cells = size * size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      thresholds[y * size + x] = (matrix[y][x] + 0.5) / cells;
    }
  }
  return thresholds;
}
