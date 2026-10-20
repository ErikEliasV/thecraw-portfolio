import Link from "next/link";
import { EdgeFades } from "@/components/ui/edge-fades";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { LOREM_LONG } from "@/constants/pages";
import { FEATURED_SLIDES, getProjectHref } from "@/constants/projects";
import { PROPOSAL_HREF, SERVICE_DETAILS } from "@/constants/services";
import { cn } from "@/utils/cn";

type ServiceDetailSectionProps = {
  service: (typeof SERVICE_DETAILS)[number];
};

/** Figma "Services" detail (Branding): blurred hero and the projects slider. */
export function ServiceDetailSection({ service }: ServiceDetailSectionProps) {
  return (
    <>
      <section
        data-header-theme="light"
        className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-black-graw pb-64 text-white lg:block lg:h-1400 lg:min-h-0 lg:pb-0"
      >
        <ParallaxImage
          src={service.image}
          alt=""
          priority
          imageClassName="object-[50%_36%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-tint backdrop-blur-veil"
        />
        <div className="relative flex flex-col gap-32 px-16 lg:absolute lg:inset-x-0 lg:top-669 lg:px-52">
          <div className="flex flex-col items-start gap-16 lg:flex-row lg:items-center lg:justify-between">
            <a
              href={PROPOSAL_HREF}
              className="flex h-64 w-200 items-center justify-center bg-paper text-button text-red-graw transition-colors duration-300 ease-power3 hover:bg-white-graw"
            >
              {service.hire}
            </a>
            <SplitReveal
              as="h1"
              split="chars"
              trigger="load"
              className="text-title"
            >
              {service.title}
            </SplitReveal>
            <p className="text-meta text-orange lg:w-99">{service.category}</p>
          </div>
          <Reveal>
            <p className="text-body">{LOREM_LONG}</p>
          </Reveal>
        </div>
      </section>

      <section
        data-header-theme="light"
        aria-label={service.projectsLabel}
        className="relative overflow-hidden bg-black-graw pt-24 pb-32 lg:h-1400 lg:p-0"
      >
        <p className="px-16 text-xl text-red-graw lg:absolute lg:top-21 lg:left-[calc(var(--spacing)*922.5)] lg:-translate-x-1/2 lg:px-0 lg:whitespace-nowrap">
          {service.projectsLabel}
        </p>

        <div
          data-lenis-prevent-horizontal
          className="mt-24 flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto lg:absolute lg:inset-x-0 lg:top-117 lg:mt-0"
        >
          {FEATURED_SLIDES.map((project, index) => (
            <Link
              key={index}
              href={getProjectHref(project)}
              className="group relative block aspect-[1920/1166] w-full shrink-0 snap-center overflow-hidden bg-white-graw text-white"
            >
              <ParallaxImage
                src={project.cover}
                alt=""
                imageClassName="object-[50%_39.5%] transition-transform duration-700 ease-power3"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(41.09deg,var(--color-shade)_0.156%,transparent_93.658%)]"
              />
              <span className="absolute bottom-24 left-16 flex flex-col gap-12 lg:inset-0 lg:block">
                <span className="flex gap-38 text-meta lg:absolute lg:top-[53.9%] lg:left-947">
                  <span className="lg:w-107">{project.category}</span>
                  <span className="lg:w-130">{project.year}</span>
                </span>
                <span className="text-title whitespace-nowrap lg:absolute lg:top-[57.41%] lg:left-235.5">
                  {project.title}
                </span>
                <span className="flex gap-2 lg:absolute lg:top-[72.15%] lg:left-235.5">
                  {FEATURED_SLIDES.map((_, dot) => (
                    <span
                      key={dot}
                      className={cn(
                        "size-9.75 rounded-full",
                        dot === index ? "bg-red-graw" : "bg-white-graw",
                      )}
                    />
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </div>
        <EdgeFades tone="dark" className="hidden w-222 lg:block" />

        <Link
          href="/services"
          className="group relative z-20 mx-16 mt-24 flex h-86 w-172 items-center justify-center bg-coal text-xl text-red-graw lg:absolute lg:top-1300 lg:left-858 lg:m-0"
        >
          <span className="transition-transform duration-300 ease-power3 group-hover:-translate-x-6">
            {service.back}
          </span>
        </Link>
      </section>
    </>
  );
}
