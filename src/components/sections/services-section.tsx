"use client";

import { useRef } from "react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { PROPOSAL_CTA, PROPOSAL_HREF, SERVICES } from "@/constants/services";
import { EASE, gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";
import { MASK_ROOM } from "@/utils/mask-room";
import { themeColor } from "@/utils/theme-color";

/** Distance between the text block and the red box on each row (Figma). */
const ROW_GAPS = ["lg:gap-444", "lg:gap-184", "lg:gap-327"] as const;
/** Where each row's details come in from: Branding, Products, Motion e 3D. */
const ROW_ENTRANCES = ["right", "bottom", "right"] as const;

/**
 * Figma "Projetos" (1400px, BLACK GRAW): numbered services with deliverables.
 * The title drops in red and turns white as it lands; then each row shows its
 * number and brings its details in from the right or from below.
 */
export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const title = section?.querySelector<HTMLElement>("[data-title]");
      if (!section || !title) return;

      const media = gsap.matchMedia();
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          gsap.set(title, { visibility: "visible" });
          if (context.conditions?.reduced) return;

          const split = SplitText.create(title, {
            type: "lines,chars",
            mask: "lines",
          });
          gsap.set(split.masks, MASK_ROOM);

          // Rows wait for the title to land before they start.
          const waiting: gsap.core.Timeline[] = [];
          const titleIn = gsap
            .timeline({
              paused: true,
              onComplete: () =>
                waiting
                  .splice(0)
                  .forEach((row, order) => row.delay(order * 0.15).play()),
            })
            .fromTo(
              split.chars,
              { yPercent: -120, color: themeColor("red-graw") },
              {
                yPercent: 0,
                color: themeColor("red-graw"),
                duration: 1,
                ease: EASE.expo,
                stagger: 0.05,
              },
            )
            .to(
              split.chars,
              {
                color: themeColor("white"),
                duration: 0.5,
                ease: EASE.inOut,
                stagger: 0.05,
                clearProps: "color",
              },
              0.55,
            );
          ScrollTrigger.create({
            trigger: title,
            start: "top 85%",
            once: true,
            onEnter: () => titleIn.play(),
          });

          gsap.utils
            .toArray<HTMLElement>("[data-row]", section)
            .forEach((row, index) => {
              const fromRight = ROW_ENTRANCES[index] === "right";
              const rowIn = gsap
                .timeline({ paused: true })
                .from(row.querySelectorAll("[data-digit]"), {
                  yPercent: 100,
                  autoAlpha: 0,
                  duration: 0.6,
                  ease: EASE.out,
                  stagger: 0.08,
                })
                .from(
                  row.querySelectorAll("[data-detail]"),
                  {
                    x: fromRight
                      ? () => Math.min(window.innerWidth * 0.2, 400)
                      : 0,
                    y: fromRight ? 0 : 160,
                    autoAlpha: 0,
                    duration: 1.1,
                    ease: EASE.expo,
                    stagger: 0.12,
                  },
                  0.3,
                );
              ScrollTrigger.create({
                trigger: row,
                start: "top 85%",
                once: true,
                onEnter: () => {
                  if (titleIn.progress() === 1) rowIn.play();
                  else waiting.push(rowIn);
                },
              });
            });

          return () => split.revert();
        },
      );
      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="relative flex flex-col gap-48 bg-black-graw px-16 py-96 text-white lg:block lg:h-1400 lg:p-0"
    >
      <h2
        data-title
        className="invisible text-display lg:absolute lg:top-252 lg:left-293 lg:w-580"
      >
        services
      </h2>

      <ol className="flex flex-col gap-56 lg:absolute lg:top-436 lg:left-208 lg:w-1522 lg:gap-78">
        {SERVICES.map((service, index) => (
          <li
            key={service.title}
            data-row
            className={cn(
              "flex flex-col gap-24 lg:flex-row lg:items-center",
              ROW_GAPS[index],
            )}
          >
            <div className="flex items-center gap-24 lg:gap-86">
              <span
                aria-hidden
                className="flex w-40 shrink-0 flex-col text-number lg:w-75"
              >
                {service.number.split("").map((digit, position) => (
                  <span key={position} data-digit>
                    {digit}
                  </span>
                ))}
              </span>
              <div
                data-detail
                className="flex flex-col gap-18 lg:h-126 lg:w-420"
              >
                <h3 className="text-subheading">{service.title}</h3>
                <p className="text-desc font-light">{service.description}</p>
              </div>
            </div>

            <div
              data-detail
              className="flex gap-20.5 bg-red-graw pt-21 pr-23 pb-15 pl-22 text-tag font-medium uppercase lg:h-147 lg:w-495"
            >
              {service.deliverables.map((column, columnIndex) => (
                <ul
                  key={columnIndex}
                  className="grid grid-rows-3 gap-y-6.75 lg:h-111"
                >
                  {column.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <ArrowLink
        href={PROPOSAL_HREF}
        className="self-start lg:absolute lg:top-1094 lg:left-1025"
      >
        {PROPOSAL_CTA}
      </ArrowLink>
    </section>
  );
}
