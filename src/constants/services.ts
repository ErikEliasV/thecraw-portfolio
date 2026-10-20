import { STUDIO_INFO } from "@/constants/studio";
import type { Service } from "@/types/project";
import { asset } from "@/utils/asset";

const DESCRIPTION =
  "Criamos o conceito visual da marca e todos oe elemtnos visuais que fazem ela ter personalizadade própria, do logotipo a cores fortes, imagens e grafismos";

const DELIVERABLES = [
  ["Estratégia de marca", "Identidade visual", "Identidade verbal"],
  ["Brand Guidelines", "Aplicações da marca", "Gestão e evolução da marca"],
] as const;

export const SERVICES: readonly Service[] = [
  {
    number: "01",
    title: "Branding",
    description: DESCRIPTION,
    deliverables: DELIVERABLES,
  },
  {
    number: "02",
    title: "Products",
    description: DESCRIPTION,
    deliverables: DELIVERABLES,
  },
  {
    number: "03",
    title: "Motion e 3D",
    description: DESCRIPTION,
    deliverables: DELIVERABLES,
  },
];

/** Figma CTA copy, kept as written in the design. */
export const PROPOSAL_CTA = "Socilite sua proposta";
export const PROPOSAL_HREF = `mailto:${STUDIO_INFO.email}`;

export const LETS_WORK = {
  title: "Let's work toguether",
  copy: [
    "Work witch us if average isn't your thing.",
    "Drop it, we'll build it!",
  ],
} as const;

/** Figma "Services" accordion: three blank panels (red, taupe, gray). */
export const SERVICE_PANELS = [
  { title: "Branding", className: "bg-red-graw", href: "/services/branding" },
  { title: "Products", className: "bg-taupe", href: null },
  { title: "Motion e 3D", className: "bg-gray-graw", href: null },
] as const;

export const SERVICE_DETAILS = [
  {
    slug: "branding",
    title: "Branding",
    category: "brand identy",
    image: asset("/images/services/branding.webp"),
    hire: "contrate",
    projectsLabel: "projects <branding>",
    back: "back",
  },
] as const;
