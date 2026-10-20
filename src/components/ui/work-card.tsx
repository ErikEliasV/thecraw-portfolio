import Link from "next/link";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { getProjectHref } from "@/constants/projects";
import type { Project } from "@/types/project";

type WorkCardProps = {
  project: Project;
};

/** Figma Work card (1806×876): cover, name and red category box. */
export function WorkCard({ project }: WorkCardProps) {
  return (
    <Link
      href={getProjectHref(project)}
      className="group relative block aspect-[1806/876] w-full overflow-hidden bg-white-graw text-white"
    >
      <ParallaxImage
        src={project.cover}
        alt=""
        sizes="(min-width: 1024px) 94vw, 100vw"
        className="transition-transform duration-700 ease-power3 group-hover:scale-[1.02] motion-reduce:transition-none"
        imageClassName="object-[50%_39.25%]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(36.96deg,var(--color-shade)_0.156%,transparent_93.658%)]"
      />
      <span className="absolute bottom-16 left-16 flex items-center lg:top-686 lg:bottom-auto lg:left-97">
        <span className="pr-16 text-card lg:flex lg:h-160.25 lg:w-272.25 lg:items-center lg:pr-0">
          {project.name}
        </span>
        <span className="flex gap-24 bg-red-graw px-16 py-12 text-meta transition-transform duration-300 ease-power3 group-hover:translate-x-12 lg:h-113.25 lg:w-431.25 lg:gap-47 lg:pt-46 lg:pr-3 lg:pb-45 lg:pl-86">
          <span className="lg:w-133.5">{project.category}</span>
          <span className="lg:w-161.75">{project.year}</span>
        </span>
      </span>
    </Link>
  );
}
