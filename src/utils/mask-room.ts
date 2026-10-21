/**
 * Room for glyphs around SplitText line masks: tight Figma line heights push
 * ascenders and descenders out of the line box, and negative tracking pushes
 * the last letter past its end. Negative margins keep the lines in place.
 */
export const MASK_ROOM = {
  padding: "0.12em 0.15em 0.18em",
  margin: "-0.12em -0.15em -0.18em",
} as const;
