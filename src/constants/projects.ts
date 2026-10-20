import type { Project } from "@/types/project";

/** The Figma uses one placeholder project everywhere. */
export const PROJECTS: readonly Project[] = [
  {
    slug: "allce",
    name: "Allce",
    title: "Project Name",
    client: "Allce. Co",
    category: "brand identy",
    year: "2022",
    cover: "/images/home/featured-project.webp",
    thumbnail: "/images/home/project-thumb-lorena.webp",
  },
];

export const FEATURED_PROJECT = PROJECTS[0];

/** Featured slider: three slides, as marked by the Figma dots. */
export const FEATURED_SLIDES: readonly Project[] = [
  FEATURED_PROJECT,
  FEATURED_PROJECT,
  FEATURED_PROJECT,
];

/** "Frame 96" carousel cards. */
export const CAROUSEL_CARD = {
  label: "brand",
  year: "2026",
  cta: "view project",
} as const;

export const CAROUSEL_PROJECTS: readonly Project[] = [
  FEATURED_PROJECT,
  FEATURED_PROJECT,
  FEATURED_PROJECT,
];

export function getProjectHref(project: Project) {
  return `/work/${project.slug}`;
}
