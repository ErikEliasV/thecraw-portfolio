export type TextMask = {
  url: string;
  width: number;
  height: number;
  /** Room around the element box for glyphs that overflow its line box. */
  bleed: number;
};

/**
 * Draws an element's single line of text, opaque on transparent, as an image
 * for a CSS mask. Mirrors the CSS layout: glyphs sit on the line box
 * baseline and letter spacing follows every character.
 */
export function createTextMask(element: HTMLElement): TextMask | null {
  const style = getComputedStyle(element);
  const text = element.textContent ?? "";
  const fontSize = parseFloat(style.fontSize);
  const bleed = Math.ceil(fontSize * 0.3);
  const width = element.offsetWidth + bleed * 2;
  const height = element.offsetHeight + bleed * 2;
  const ratio = Math.min(window.devicePixelRatio, 2);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.scale(ratio, ratio);
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } =
    context.measureText(text);
  const lineHeight = parseFloat(style.lineHeight) || element.offsetHeight;
  const baseline = bleed + (lineHeight - ascent - descent) / 2 + ascent;
  const spacing = parseFloat(style.letterSpacing) || 0;

  // One glyph at a time, at the kerned advance plus the CSS letter spacing.
  for (let index = 0; index < text.length; index++) {
    const x = context.measureText(text.slice(0, index)).width;
    context.fillText(text[index], bleed + x + index * spacing, baseline);
  }

  return { url: canvas.toDataURL(), width, height, bleed };
}
