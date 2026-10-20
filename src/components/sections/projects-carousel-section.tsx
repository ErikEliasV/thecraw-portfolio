import { EdgeFades } from "@/components/ui/edge-fades";
import { Marquee } from "@/components/ui/marquee";
import { ProjectCard } from "@/components/ui/project-card";
import { CAROUSEL_PROJECTS } from "@/constants/projects";
import { cn } from "@/utils/cn";

type ProjectsCarouselSectionProps = {
  className?: string;
};

/** Figma "Frame 96" (440px): looping project cards with side fades. */
export function ProjectsCarouselSection({
  className,
}: ProjectsCarouselSectionProps) {
  return (
    <section
      data-header-theme="dark"
      aria-label="Outros projetos"
      className={cn(
        "relative overflow-hidden bg-white-graw py-48 lg:h-440 lg:py-0",
        className,
      )}
    >
      <Marquee
        speed={70}
        className="lg:absolute lg:inset-x-0 lg:top-86"
        itemsClassName="gap-16 pr-16 lg:gap-31 lg:pr-31"
      >
        {CAROUSEL_PROJECTS.map((project, index) => (
          <ProjectCard key={`${project.slug}-${index}`} project={project} />
        ))}
      </Marquee>
      <EdgeFades tone="light" className="w-48 lg:w-222" />
    </section>
  );
}
