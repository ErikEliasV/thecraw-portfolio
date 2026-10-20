"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { SplitReveal } from "@/components/ui/split-reveal";
import { FEATURED_SLIDES, getProjectHref } from "@/constants/projects";
import { cn } from "@/utils/cn";

const SLIDE_COUNT = FEATURED_SLIDES.length;

/** Figma "Frame 80": featured project slider with previous/next previews. */
export function FeaturedProjectSection() {
  const [index, setIndex] = useState(0);
  const slide = FEATURED_SLIDES[index];
  const previous = FEATURED_SLIDES[(index - 1 + SLIDE_COUNT) % SLIDE_COUNT];
  const next = FEATURED_SLIDES[(index + 1) % SLIDE_COUNT];
  const go = (step: number) =>
    setIndex((current) => (current + step + SLIDE_COUNT) % SLIDE_COUNT);

  return (
    <section
      data-header-theme="light"
      aria-roledescription="carrossel"
      aria-label="Projetos em destaque"
      className="relative h-svh overflow-hidden bg-white-graw text-white"
    >
      <ParallaxImage
        src={slide.cover}
        alt=""
        imageClassName="object-[50%_39.5%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(41.09deg,var(--color-shade)_0.156%,transparent_93.658%)]"
      />

      <div className="absolute inset-x-16 bottom-48 flex flex-col gap-16 lg:static">
        <button
          type="button"
          aria-label={`Projeto anterior: ${previous.title}`}
          className="group hidden items-center lg:absolute lg:top-[43.15%] lg:left-218 lg:z-10 lg:flex"
          onClick={() => go(-1)}
        >
          <span className="relative block h-89.5 w-159.5 overflow-hidden">
            <Image
              src={previous.thumbnail}
              alt=""
              width={1200}
              height={601}
              className="absolute top-[-3.66%] left-[-27.77%] h-[129.05%] w-[144.59%] max-w-none transition-transform duration-500 ease-power3 group-hover:scale-105"
            />
          </span>
          <span className="flex h-90.5 w-56 items-center justify-center bg-white">
            <Image
              src="/icons/chevron-right-dark.svg"
              alt=""
              width={22}
              height={22}
              className="size-22 transition-transform duration-300 ease-power3 group-hover:translate-x-3"
            />
          </span>
        </button>

        <p className="flex gap-35 text-meta lg:absolute lg:top-[53.89%] lg:left-877">
          <span className="w-99">{slide.category}</span>
          <span className="w-120">{slide.year}</span>
        </p>

        <SplitReveal
          key={index}
          as="h2"
          split="chars"
          className="text-title whitespace-nowrap lg:absolute lg:top-[57.39%] lg:left-218"
        >
          <Link
            href={getProjectHref(slide)}
            className="after:absolute after:inset-0 focus-visible:underline"
          >
            {slide.title}
          </Link>
        </SplitReveal>

        <div
          role="tablist"
          aria-label="Slides"
          className="z-10 flex gap-2 lg:absolute lg:top-[72.13%] lg:left-218"
        >
          {FEATURED_SLIDES.map((item, dot) => (
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
              onClick={() => setIndex(dot)}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={`Próximo projeto: ${next.title}`}
          className="group z-10 flex items-center self-end lg:absolute lg:top-[58.7%] lg:left-1424"
          onClick={() => go(1)}
        >
          <span className="relative block h-90 w-160 overflow-hidden lg:h-150 lg:w-267">
            <Image
              src={next.thumbnail}
              alt=""
              width={1200}
              height={601}
              className="absolute top-[-4.59%] left-[-29.12%] h-[131.29%] w-[147.1%] max-w-none transition-transform duration-500 ease-power3 group-hover:scale-105"
            />
          </span>
          <span className="flex h-90 w-56 items-center justify-center bg-olive lg:h-150 lg:w-93">
            <Image
              src="/icons/chevron-right-light.svg"
              alt=""
              width={37}
              height={37}
              className="size-24 transition-transform duration-300 ease-power3 group-hover:translate-x-3 lg:size-36.5"
            />
          </span>
        </button>
      </div>
    </section>
  );
}
