"use client";

import { useEffect, type RefObject } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { createTextMask, type TextMask } from "@/utils/text-mask";

/** Opacity of the panel inside the word: 1 = solid, 0 = see-through. */
const FILL = "--knockout-fill";
const MASK_PROPERTIES = [
  "mask-image",
  "mask-composite",
  "mask-repeat",
  "mask-size",
  "mask-position",
] as const;

/** The content at rest (entrance finished), so the word sits where it is drawn. */
function atRest(element: HTMLElement) {
  const { transform } = getComputedStyle(element);
  return transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
}

/**
 * While a menu link is hovered (or focused from the keyboard), its word is
 * cut out of the panel: the panel is masked by the word's glyphs, so the word
 * shows the blurred page behind the panel, like the menu backdrop.
 */
export function useMenuKnockout(
  rootRef: RefObject<HTMLElement | null>,
  open: boolean,
) {
  useEffect(() => {
    const root = rootRef.current;
    const panel = root?.querySelector<HTMLElement>("[data-menu-panel]");
    const content = root?.querySelector<HTMLElement>("[data-menu-content]");
    if (!open || !panel || !content) return;
    if (!CSS.supports("mask-composite", "subtract")) return;

    const masks = new Map<string, TextMask | null>();
    let link: HTMLElement | null = null;
    let word: HTMLElement | null = null;
    let mask: TextMask | null = null;
    let fade: gsap.core.Tween | undefined;

    // Follows the word while the thumbnail pushes it.
    const place = () => {
      if (!word || !mask) return;
      const origin = panel.getBoundingClientRect();
      const box = word.getBoundingClientRect();
      const x = box.left - origin.left - mask.bleed;
      const y = box.top - origin.top - mask.bleed;
      panel.style.setProperty("mask-position", `0 0, 0 0, ${x}px ${y}px`);
    };

    const clear = () => {
      gsap.ticker.remove(place);
      MASK_PROPERTIES.forEach((property) =>
        panel.style.removeProperty(property),
      );
      panel.style.removeProperty(FILL);
      word = null;
      mask = null;
    };

    const release = () => {
      if (!link) return;
      delete link.dataset.knockout;
      link = null;
      fade?.kill();
      fade = gsap.to(panel, {
        [FILL]: 1,
        duration: 0.3,
        ease: EASE.out,
        onComplete: clear,
      });
    };

    const cut = (target: HTMLElement) => {
      const nextWord = target.querySelector<HTMLElement>("[data-menu-link]");
      if (target === link || !nextWord || !atRest(content)) return;
      if (link) delete link.dataset.knockout;

      const font = getComputedStyle(nextWord).font;
      const key = `${nextWord.textContent}|${font}|${window.devicePixelRatio}`;
      if (!masks.has(key)) masks.set(key, createTextMask(nextWord));
      const nextMask = masks.get(key);
      if (!nextMask) return;

      link = target;
      word = nextWord;
      mask = nextMask;
      link.dataset.knockout = "";
      // Top to bottom: see-through amount, whole panel, minus the glyphs.
      panel.style.setProperty(
        "mask-image",
        `linear-gradient(rgb(0 0 0 / var(${FILL})) 0 0), linear-gradient(#000 0 0), url(${mask.url})`,
      );
      panel.style.setProperty("mask-composite", "add, subtract, add");
      panel.style.setProperty("mask-repeat", "no-repeat");
      panel.style.setProperty(
        "mask-size",
        `100% 100%, 100% 100%, ${mask.width}px ${mask.height}px`,
      );
      place();
      gsap.ticker.add(place);

      fade?.kill();
      if (!panel.style.getPropertyValue(FILL))
        panel.style.setProperty(FILL, "1");
      fade = gsap.to(panel, { [FILL]: 0, duration: 0.3, ease: EASE.out });
    };

    const linkFrom = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>("a[href]") : null;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = linkFrom(event.target);
      if (target) cut(target);
      else release();
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = linkFrom(event.target);
      if (target?.matches(":focus-visible")) cut(target);
    };

    panel.addEventListener("pointermove", onPointerMove);
    panel.addEventListener("pointerleave", release);
    panel.addEventListener("focusin", onFocusIn);
    panel.addEventListener("focusout", release);
    return () => {
      panel.removeEventListener("pointermove", onPointerMove);
      panel.removeEventListener("pointerleave", release);
      panel.removeEventListener("focusin", onFocusIn);
      panel.removeEventListener("focusout", release);
      if (link) delete link.dataset.knockout;
      link = null;
      fade?.kill();
      clear();
    };
  }, [rootRef, open]);
}
