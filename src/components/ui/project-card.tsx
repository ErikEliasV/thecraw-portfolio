import Image from "next/image";
import Link from "next/link";
import { RollText } from "@/components/ui/roll-text";
import { CAROUSEL_CARD, getProjectHref } from "@/constants/projects";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
};

/** Figma carousel card (608×268): cover with label, name, year and CTA. */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={getProjectHref(project)}
      className="group relative block h-170 w-300 shrink-0 overflow-hidden bg-white-graw px-20 py-20 text-white lg:h-268 lg:w-608 lg:pt-42 lg:pr-70 lg:pb-55 lg:pl-58"
    >
      <Image
        src={project.cover}
        alt=""
        fill
        sizes="(min-width: 1024px) 32vw, 300px"
        className="object-cover object-[50%_40%] transition-transform duration-700 ease-power3 group-hover:scale-105 motion-reduce:transition-none"
      />
      <span className="relative flex h-full items-start justify-between lg:h-auto lg:w-480">
        <span className="flex h-full flex-col justify-between lg:h-auto lg:w-109 lg:justify-start lg:gap-85">
          <span className="text-md">{CAROUSEL_CARD.label}</span>
          <span className="text-lg">{project.name}</span>
        </span>
        <span className="flex h-full flex-col items-end justify-between lg:h-auto lg:w-116 lg:justify-start lg:gap-109">
          <span className="text-md">{CAROUSEL_CARD.year}</span>
          <RollText className="text-cta">{CAROUSEL_CARD.cta}</RollText>
        </span>
      </span>
    </Link>
  );
}
