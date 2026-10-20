import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailSection } from "@/components/sections/project-detail-section";
import { ProjectsCarouselSection } from "@/components/sections/projects-carousel-section";
import { PROJECTS } from "@/constants/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((item) => item.slug === slug);
  return { title: project?.name };
}

export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    // The Figma "Project Open" frame is 1440 wide: scale this page from it.
    <main
      id="conteudo"
      className="bg-paper [--fluid:calc(100vw/1440)] lg:[--spacing:calc(100vw/1440)]"
    >
      <ProjectDetailSection project={project} />
      <ProjectsCarouselSection className="mt-31 bg-paper" />
    </main>
  );
}
