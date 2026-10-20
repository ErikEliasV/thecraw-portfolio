import { STUDIO_INFO } from "@/constants/studio";
import type { Service } from "@/types/project";

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
