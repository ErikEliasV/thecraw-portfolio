/** Prefixes a `public/` path with the deploy base path (GitHub Pages sub-path). */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
