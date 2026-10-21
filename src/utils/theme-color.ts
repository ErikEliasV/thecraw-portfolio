/** Value of a theme color token (`--color-<token>`), for GSAP color tweens. */
export function themeColor(token: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${token}`)
    .trim();
}
