import type { Discipline, Project } from "@/types/project";
import { asset } from "@/utils/asset";

/** The Figma uses one placeholder project everywhere. */
export const PROJECTS: readonly Project[] = [
  {
    slug: "allce",
    discipline: "brand",
    name: "Allce",
    title: "Project Name",
    client: "Allce. Co",
    category: "brand identy",
    year: "2022",
    cover: asset("/images/home/featured-project.webp"),
    thumbnail: asset("/images/home/project-thumb-lorena.webp"),
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

/** Work page grid: five cards in the Figma. */
export const WORK_PROJECTS: readonly Project[] = Array.from(
  { length: 5 },
  () => FEATURED_PROJECT,
);

export const DISCIPLINE_FILTERS: readonly {
  id: Discipline;
  label: string;
  className: string;
}[] = [
  { id: "brand", label: "Brand", className: "bg-red-graw" },
  { id: "motion", label: "Motion & 3D", className: "bg-yellow" },
  { id: "product", label: "Product", className: "bg-orange" },
];
