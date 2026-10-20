"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeaderLogo } from "@/components/layout/header-logo";
import { SiteMenu } from "@/components/layout/site-menu";
import { RollText } from "@/components/ui/roll-text";
import { DURATION, EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

const HIDE_AFTER = 120;

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuOpenRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      // Header color follows the section underneath it.
      const sections = gsap.utils.toArray<HTMLElement>("[data-header-theme]");
      const line = () => header.offsetTop + header.offsetHeight / 2;
      header.dataset.theme = sections[0]?.dataset.headerTheme ?? "light";
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: () => `top ${line()}px`,
          end: () => `bottom ${line()}px`,
          onToggle: (self) => {
            if (self.isActive)
              header.dataset.theme = section.dataset.headerTheme;
          },
        });
      });

      // Hide while scrolling down, show again on the way up.
      let hidden = false;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const shouldHide =
            self.direction === 1 &&
            self.scroll() > HIDE_AFTER &&
            !menuOpenRef.current;
          if (shouldHide === hidden) return;
          hidden = shouldHide;
          gsap.to(header, {
            yPercent: hidden ? -150 : 0,
            duration: DURATION.hover + 0.1,
            ease: EASE.out,
            overwrite: "auto",
          });
        },
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <>
      <header
        ref={headerRef}
        inert={menuOpen}
        className="group/header fixed inset-x-0 top-0 z-40 px-16 pt-16 text-white transition-colors duration-300 data-[theme=dark]:text-black lg:pt-29 lg:pr-46 lg:pl-50"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="The Craw, página inicial"
            className="block"
          >
            <HeaderLogo />
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className={cn(
              "group flex h-45 w-129 items-center justify-center text-nav transition-opacity duration-300",
              menuOpen && "opacity-0",
            )}
            onClick={() => setMenuOpen(true)}
          >
            <RollText>Menu</RollText>
          </button>
        </div>
      </header>
      <SiteMenu
        open={menuOpen}
        onClose={closeMenu}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
