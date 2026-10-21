"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { SplitReveal } from "@/components/ui/split-reveal";
import { STUDIO_DITHER } from "@/constants/dither";
import { STUDIO_PAGE, TEAM_MEMBERS } from "@/constants/pages";
import { FEATURED_PROJECT, getProjectHref } from "@/constants/projects";
import { DitherImage } from "@/features/dither-image";
import { asset } from "@/utils/asset";

const MEMBER_COUNT = TEAM_MEMBERS.length;

/** Figma "Studio" hero: portrait, team member, project lead card and headline. */
export function StudioHeroSection() {
  const [index, setIndex] = useState(0);
  const member = TEAM_MEMBERS[index];
  const go = (step: number) =>
    setIndex((current) => (current + step + MEMBER_COUNT) % MEMBER_COUNT);

  return (
    <section
      data-header-theme="light"
      className="@container relative flex min-h-svh flex-col overflow-hidden bg-black-graw text-white lg:block lg:h-svh"
    >
      <DitherImage {...STUDIO_DITHER} animation="intro" />

      <div className="relative h-[60svh] w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-897">
        <ParallaxImage
          src={STUDIO_PAGE.portrait}
          alt=""
          priority
          sizes="(min-width: 1024px) 47vw, 100vw"
          imageClassName="object-[50%_30%]"
        />
      </div>

      <div
        aria-roledescription="carrossel"
        aria-label="Equipe"
        className="relative flex flex-col gap-24 px-16 pt-32 lg:absolute lg:top-88 lg:left-960 lg:w-556 lg:gap-37 lg:p-0"
      >
        <div className="flex gap-11">
          <button
            type="button"
            aria-label="Pessoa anterior"
            className="transition-transform duration-300 ease-power3 hover:-translate-x-3"
            onClick={() => go(-1)}
          >
            <Image
              src={asset("/icons/arrow-prev.svg")}
              alt=""
              width={48}
              height={48}
              className="size-40 rotate-180 lg:size-48"
            />
          </button>
          <button
            type="button"
            aria-label="Próxima pessoa"
            className="transition-transform duration-300 ease-power3 hover:translate-x-3"
            onClick={() => go(1)}
          >
            <Image
              src={asset("/icons/arrow-next.svg")}
              alt=""
              width={48}
              height={48}
              className="size-40 lg:size-48"
            />
          </button>
        </div>
        <div key={index} className="flex flex-col gap-15">
          <div className="flex items-center gap-18 whitespace-nowrap">
            <SplitReveal
              as="h2"
              split="chars"
              trigger="load"
              className="text-subheading leading-[1.2] tracking-tight"
            >
              {member.name}
            </SplitReveal>
            <p className="text-body leading-[1.03] text-red-graw">
              {member.role}
            </p>
          </div>
          <SplitReveal
            split="lines"
            trigger="load"
            delay={0.15}
            className="text-nav leading-[1.03] text-white-graw lg:h-271"
          >
            {member.bio}
          </SplitReveal>
        </div>
      </div>

      <div className="relative flex flex-col gap-12 px-16 pt-32 lg:absolute lg:top-[50.46%] lg:left-1475 lg:p-0">
        <p className="text-label">{STUDIO_PAGE.projectsLead}</p>
        <Link
          href={getProjectHref(FEATURED_PROJECT)}
          className="group flex items-center"
        >
          <span className="relative block h-90 w-160 overflow-hidden lg:h-150 lg:w-267">
            <Image
              src={FEATURED_PROJECT.thumbnail}
              alt={FEATURED_PROJECT.name}
              width={1200}
              height={601}
              className="absolute top-[-4.59%] left-[-29.12%] h-[131.29%] w-[147.1%] max-w-none transition-transform duration-500 ease-power3 group-hover:scale-105"
            />
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
        </Link>
      </div>

      {/* Scaled with the section (not the viewport) and its Figma side margin,
          so the line fits the width that is really there. */}
      <SplitReveal
        as="h1"
        split="chars"
        trigger="load"
        delay={0.2}
        className="relative mt-auto px-[calc(var(--fluid)*50)] pt-48 pb-16 text-giant whitespace-nowrap [--fluid:calc(100cqw/1920)] lg:absolute lg:top-[71.13%] lg:left-50 lg:mt-0 lg:p-0"
      >
        {STUDIO_PAGE.headline}
      </SplitReveal>
    </section>
  );
}
