"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { SplitReveal } from "@/components/ui/split-reveal";
import { UnderReveal } from "@/components/ui/under-reveal";
import { FEATURED_SLIDES, getProjectHref } from "@/constants/projects";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";
import { asset } from "@/utils/asset";

const SLIDE_COUNT = FEATURED_SLIDES.length;
/** Seconds a slide stays before the next one comes in from the right. */
const AUTOPLAY_DELAY = 5;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Layers that slide inside their own clip box, in entrance order. */
const TRACKS = ["prev-thumb", "next-thumb", "meta", "title"] as const;
/** How far a track waits or leaves, in %: past the room around its text. */
const TRACK_SHIFT = 120;

const wrap = (index: number) => (index + SLIDE_COUNT) % SLIDE_COUNT;

type Direction = 1 | -1;

/**
 * Figma "Frame 80": featured project carousel with previous/next previews.
 * Every slide is rendered; the next one comes in from the right on its own
 * (paused on hover, focus or off screen) or from the arrows and dots.
 */
export function FeaturedProjectSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const showRef = useRef<((to: number, direction: Direction) => void) | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const previous = FEATURED_SLIDES[wrap(index - 1)];
  const next = FEATURED_SLIDES[wrap(index + 1)];
  const go = (to: number, direction: Direction) =>
    showRef.current?.(wrap(to), direction);

  useGSAP(
    (_, contextSafe) => {
      const section = sectionRef.current;
      if (!section || !contextSafe) return;

      const select = (layer: string, slide: number) =>
        section.querySelectorAll(`[data-${layer}="${slide}"]`);

      // Only the first slide shows; the others wait off to the right.
      for (let slide = 1; slide < SLIDE_COUNT; slide++) {
        gsap.set(select("cover", slide), { visibility: "hidden" });
        TRACKS.forEach((track) =>
          gsap.set(select(track, slide), { xPercent: TRACK_SHIFT }),
        );
      }

      let current = 0;
      let transition: gsap.core.Timeline | undefined;
      let autoplay: gsap.core.Tween | undefined;
      const holds = new Set(["offscreen"]);

      const schedule = contextSafe(() => {
        autoplay?.kill();
        if (holds.size || window.matchMedia(REDUCED_MOTION).matches) return;
        autoplay = gsap.delayedCall(AUTOPLAY_DELAY, () =>
          show(wrap(current + 1), 1),
        );
      });
      const hold = (reason: string, on: boolean) => {
        if (on) holds.add(reason);
        else holds.delete(reason);
        schedule();
      };

      const show = contextSafe((to: number, direction: Direction) => {
        if (to === current) return;
        autoplay?.kill();
        transition?.progress(1);
        const from = current;
        const enter = 100 * direction;
        current = to;
        setIndex(to);

        // The new cover slides over the old one, which drifts away slower.
        transition = gsap
          .timeline({
            defaults: { duration: 1.2, ease: EASE.inOut },
            onComplete: schedule,
          })
          .set(select("cover", from), { zIndex: 0 })
          .set(select("cover", to), { zIndex: 1, visibility: "visible" })
          .fromTo(select("cover", to), { xPercent: enter }, { xPercent: 0 }, 0)
          .fromTo(
            select("cover-image", to),
            { xPercent: -enter / 2 },
            { xPercent: 0 },
            0,
          )
          .to(select("cover", from), { xPercent: -enter * 0.3 }, 0)
          .set(select("cover", from), { visibility: "hidden", xPercent: 0 });

        // Texts and previews leave to the left as the new ones arrive.
        TRACKS.forEach((track, order) => {
          transition
            ?.to(
              select(track, from),
              { xPercent: -TRACK_SHIFT * direction, duration: 0.7 },
              order * 0.04,
            )
            .fromTo(
              select(track, to),
              { xPercent: TRACK_SHIFT * direction },
              { xPercent: 0, duration: 1.1, ease: EASE.expo },
              0.3 + order * 0.06,
            );
        });

        if (window.matchMedia(REDUCED_MOTION).matches) transition.progress(1);
      });
      showRef.current = show;

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => hold("offscreen", !self.isActive),
      });
      const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType === "mouse") hold("hover", true);
      };
      const onPointerLeave = () => hold("hover", false);
      const onFocusIn = () => hold("focus", true);
      const onFocusOut = (event: FocusEvent) => {
        if (!section.contains(event.relatedTarget as Node | null)) {
          hold("focus", false);
        }
      };
      section.addEventListener("pointerenter", onPointerEnter);
      section.addEventListener("pointerleave", onPointerLeave);
      section.addEventListener("focusin", onFocusIn);
      section.addEventListener("focusout", onFocusOut);

      return () => {
        showRef.current = null;
        autoplay?.kill();
        section.removeEventListener("pointerenter", onPointerEnter);
        section.removeEventListener("pointerleave", onPointerLeave);
        section.removeEventListener("focusin", onFocusIn);
        section.removeEventListener("focusout", onFocusOut);
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      aria-roledescription="carrossel"
      aria-label="Projetos em destaque"
      className="relative h-svh overflow-hidden bg-white-graw text-white"
    >
      <UnderReveal className="absolute inset-0">
        {/* Covers stack among themselves only, under the overlay and texts. */}
        <div className="absolute inset-0 isolate">
          {FEATURED_SLIDES.map((item, slide) => (
            <div
              key={slide}
              data-cover={slide}
              className="absolute inset-0 overflow-hidden"
            >
              <div data-cover-image={slide} className="absolute inset-0">
                <ParallaxImage
                  src={item.cover}
                  alt=""
                  imageClassName="object-[50%_39.5%]"
                />
              </div>
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(41.09deg,var(--color-shade)_0.156%,transparent_93.658%)]"
        />

        <div className="absolute inset-x-16 bottom-48 flex flex-col gap-16 lg:static">
          <button
            type="button"
            aria-label={`Projeto anterior: ${previous.title}`}
            className="group hidden items-center lg:absolute lg:top-[43.15%] lg:left-218 lg:z-10 lg:flex"
            onClick={() => go(index - 1, -1)}
          >
            <span className="relative block h-89.5 w-159.5 overflow-hidden">
              {FEATURED_SLIDES.map((_, slide) => (
                <span
                  key={slide}
                  data-prev-thumb={slide}
                  className="absolute inset-0"
                >
                  <Image
                    src={FEATURED_SLIDES[wrap(slide - 1)].thumbnail}
                    alt=""
                    width={1200}
                    height={601}
                    className="absolute top-[-3.66%] left-[-27.77%] h-[129.05%] w-[144.59%] max-w-none transition-transform duration-500 ease-power3 group-hover:scale-105"
                  />
                </span>
              ))}
            </span>
            <span className="flex h-90.5 w-56 items-center justify-center bg-white">
              <Image
                src={asset("/icons/chevron-right-dark.svg")}
                alt=""
                width={22}
                height={22}
                className="size-22 transition-transform duration-300 ease-power3 group-hover:translate-x-3"
              />
            </span>
          </button>

          {/* Clip boxes leave room around the glyphs (line height, tracking). */}
          <div className="-m-[0.2em] grid overflow-hidden p-[0.2em] text-meta lg:absolute lg:top-[53.89%] lg:left-877">
            {FEATURED_SLIDES.map((item, slide) => (
              <p
                key={slide}
                data-meta={slide}
                aria-hidden={slide !== index}
                className="flex gap-35 [grid-area:1/1]"
              >
                <span className="w-99">{item.category}</span>
                <span className="w-120">{item.year}</span>
              </p>
            ))}
          </div>

          <div className="relative -m-[0.2em] grid overflow-hidden p-[0.2em] lg:absolute lg:top-[57.39%] lg:left-218">
            {FEATURED_SLIDES.map((item, slide) => (
              <div
                key={slide}
                data-title={slide}
                aria-hidden={slide !== index}
                inert={slide !== index}
                className="[grid-area:1/1]"
              >
                <SplitReveal
                  as="h2"
                  split="chars"
                  className="text-title whitespace-nowrap"
                >
                  <Link
                    href={getProjectHref(item)}
                    className="after:absolute after:inset-0 focus-visible:underline"
                  >
                    {item.title}
                  </Link>
                </SplitReveal>
              </div>
            ))}
          </div>

          <div
            role="tablist"
            aria-label="Slides"
            className="z-10 flex gap-2 lg:absolute lg:top-[72.13%] lg:left-218"
          >
            {FEATURED_SLIDES.map((_, dot) => (
              <button
                key={dot}
                type="button"
                role="tab"
                aria-selected={dot === index}
                aria-label={`Slide ${dot + 1}`}
                className={cn(
                  "size-9 rounded-full transition-colors duration-300",
                  dot === index ? "bg-red-graw" : "bg-white-graw",
                )}
                onClick={() => go(dot, dot > index ? 1 : -1)}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label={`Próximo projeto: ${next.title}`}
            className="group z-10 flex items-center self-end lg:absolute lg:top-[58.7%] lg:left-1424"
            onClick={() => go(index + 1, 1)}
          >
            <span className="relative block h-90 w-160 overflow-hidden lg:h-150 lg:w-267">
              {FEATURED_SLIDES.map((_, slide) => (
                <span
                  key={slide}
                  data-next-thumb={slide}
                  className="absolute inset-0"
                >
                  <Image
                    src={FEATURED_SLIDES[wrap(slide + 1)].thumbnail}
                    alt=""
                    width={1200}
                    height={601}
                    className="absolute top-[-4.59%] left-[-29.12%] h-[131.29%] w-[147.1%] max-w-none transition-transform duration-500 ease-power3 group-hover:scale-105"
                  />
                </span>
              ))}
            </span>
            <span className="flex h-90 w-56 items-center justify-center bg-olive lg:h-150 lg:w-93">
              <Image
                src={asset("/icons/chevron-right-light.svg")}
                alt=""
                width={37}
                height={37}
                className="size-24 transition-transform duration-300 ease-power3 group-hover:translate-x-3 lg:size-36.5"
              />
            </span>
          </button>
        </div>
      </UnderReveal>
    </section>
  );
}
