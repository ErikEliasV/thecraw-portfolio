"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { NAV_LINKS } from "@/constants/navigation";
import { useLenis } from "@/hooks/use-lenis";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

const FOCUSABLE = "a[href], button:not([disabled])";

export function SiteMenu({ open, onClose, returnFocusRef }: SiteMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      timelineRef.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: EASE.expo },
          onReverseComplete: () => gsap.set(root, { visibility: "hidden" }),
        })
        .fromTo(
          "[data-menu-veil]",
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: EASE.out },
        )
        .fromTo(
          "[data-menu-panel]",
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
          0,
        )
        .fromTo(
          "[data-menu-link]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1, stagger: 0.06 },
          0.15,
        )
        .fromTo(
          "[data-menu-close]",
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: EASE.out },
          0.3,
        );
    },
    { scope: rootRef },
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    if (open) {
      // Visible before focusing: hidden elements cannot receive focus.
      gsap.set(rootRef.current, { visibility: "visible" });
      if (reducedMotion) timeline.progress(1);
      else timeline.timeScale(1).play();
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      closeRef.current?.focus({ preventScroll: true });
      return;
    }

    if (timeline.progress() === 0) return;
    if (reducedMotion) {
      timeline.progress(0);
      gsap.set(rootRef.current, { visibility: "hidden" });
    } else {
      timeline.timeScale(1.6).reverse();
    }
    lenis?.start();
    document.documentElement.style.overflow = "";
    if (rootRef.current?.contains(document.activeElement)) {
      returnFocusRef.current?.focus({ preventScroll: true });
    }
  }, [open, lenis, reducedMotion, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !rootRef.current) return;

    const focusable = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="invisible fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
    >
      <div
        data-menu-veil
        aria-hidden
        className="absolute inset-0 backdrop-blur-menu"
        onClick={onClose}
      />
      <div
        data-menu-panel
        className="absolute inset-x-16 top-16 bg-menu px-24 pt-96 pb-48 lg:inset-x-auto lg:top-31 lg:right-55 lg:h-629 lg:w-1339 lg:p-0"
      >
        <button
          ref={closeRef}
          type="button"
          data-menu-close
          aria-label="Fechar menu"
          className="group absolute top-16 right-16 bg-black-graw px-19 pt-5 pb-4 text-nav text-red-graw lg:top-14.25 lg:right-11"
          onClick={onClose}
        >
          Menu
        </button>
        <nav aria-label="Principal">
          <ul className="flex flex-col lg:absolute lg:top-146 lg:left-101 lg:grid lg:grid-flow-col lg:grid-cols-[calc(var(--spacing)*646.75)_auto] lg:grid-rows-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="overflow-hidden">
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="block text-display text-menu-link transition-colors duration-300 ease-power3 hover:text-black-graw focus-visible:text-black-graw"
                  onClick={onClose}
                >
                  <span data-menu-link className="block">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
