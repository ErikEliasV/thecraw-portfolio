import { asset } from "@/utils/asset";

/** Figma placeholder copy, kept as written in the design. */
export const LOREM_SHORT =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero";

export const LOREM_LONG =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.";

export const WORK_PAGE = {
  title: "Work",
  intro: { heading: "Proposito", body: LOREM_SHORT },
  filterLabel: "Filter",
} as const;

export const PROJECT_PAGE = {
  solution: "Solution",
  process: "process",
  results: "results",
  resultsBody:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many",
  credits: [
    [
      { label: "Project director", value: "André Gonçalves" },
      { label: "Client", value: "Allce. Co" },
    ],
    [
      { label: "Motion Designer", value: "Alan Erick" },
      { label: "Date", value: "2024" },
    ],
  ],
  end: "END",
} as const;

const TEAM_BIO =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when";

/** Figma shows one placeholder member; the arrows cycle through the team. */
export const TEAM_MEMBERS = [
  { name: "Nome", role: "Função", bio: TEAM_BIO },
  { name: "Nome", role: "Função", bio: TEAM_BIO },
  { name: "Nome", role: "Função", bio: TEAM_BIO },
] as const;

export const STUDIO_PAGE = {
  title: "Studio",
  headline: "DIGITAL DESIGNER",
  projectsLead: "Projects Lead",
  portrait: asset("/images/studio/portrait.webp"),
  sections: [
    { heading: "Proposito", body: LOREM_SHORT },
    { heading: "Pilares", body: LOREM_SHORT },
    { heading: "Fundamentos", body: LOREM_SHORT },
  ],
  video: "video",
} as const;
