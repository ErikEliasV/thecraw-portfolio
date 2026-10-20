"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { WorkCard } from "@/components/ui/work-card";
import { WORK_PAGE } from "@/constants/pages";
import { DISCIPLINE_FILTERS, WORK_PROJECTS } from "@/constants/projects";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import type { Discipline } from "@/types/project";
import { cn } from "@/utils/cn";

/** Figma "Work": title, purpose, discipline filters and project cards. */
export function WorkSection() {
  const [filter, setFilter] = useState<Discipline | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const projects = filter
    ? WORK_PROJECTS.filter((project) => project.discipline === filter)
    : WORK_PROJECTS;
  const activeLabel = DISCIPLINE_FILTERS.find(
    (item) => item.id === filter,
  )?.label;

  // Re-entering cards after a filter change.
  useGSAP(
    () => {
      if (filter === null) return;
      gsap.from("li", {
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE.out,
        stagger: 0.08,
      });
    },
    { scope: listRef, dependencies: [filter], revertOnUpdate: true },
  );

  return (
    <section
      data-header-theme="dark"
      className="bg-paper px-16 pt-120 pb-64 text-black lg:px-0 lg:pt-147 lg:pb-136"
    >
      <div className="flex flex-col gap-40 lg:ml-51 lg:w-1818 lg:flex-row lg:items-end lg:justify-between">
        <SplitReveal
          as="h1"
          split="chars"
          trigger="load"
          className="text-mega text-ink lg:h-345.25 lg:w-725"
        >
          {WORK_PAGE.title}
        </SplitReveal>

        <Reveal className="flex flex-col gap-36 lg:w-703">
          <div data-reveal>
            <h2 className="text-heading font-light">
              {WORK_PAGE.intro.heading}
            </h2>
            <p className="text-body lg:h-100">{WORK_PAGE.intro.body}</p>
          </div>
          <div data-reveal className="flex flex-col gap-8 lg:w-610">
            <p
              id="work-filter-label"
              className="text-body leading-none font-semibold"
            >
              {WORK_PAGE.filterLabel}
            </p>
            <div
              role="group"
              aria-labelledby="work-filter-label"
              className="flex flex-wrap gap-19"
            >
              {DISCIPLINE_FILTERS.map((item) => {
                const pressed = filter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={pressed}
                    className={cn(
                      "px-51 py-14 text-body leading-none text-white transition-[transform,box-shadow] duration-300 ease-power3 hover:-translate-y-2",
                      item.className,
                      pressed &&
                        "ring-2 ring-black-graw ring-offset-2 ring-offset-paper",
                    )}
                    onClick={() => setFilter(pressed ? null : item.id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      <ul
        ref={listRef}
        aria-live="polite"
        className="mt-48 flex flex-col gap-24 lg:mt-63.75 lg:ml-50 lg:w-1806 lg:gap-39"
      >
        {projects.map((project, index) => (
          <li key={`${project.slug}-${index}`}>
            <Reveal>
              <WorkCard project={project} />
            </Reveal>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="text-body">Nenhum projeto em {activeLabel}.</li>
        )}
      </ul>
    </section>
  );
}
