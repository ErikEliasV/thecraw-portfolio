import { asset } from "@/utils/asset";

export const NAV_LINKS = [
  { label: "home", href: "/" },
  { label: "work", href: "/work" },
  { label: "studio", href: "/studio" },
  { label: "services", href: "/services" },
] as const;

/** Menu link thumbnail: the placeholder project image until there is video. */
export const MENU_VISUAL = asset("/images/shared/menu-visual.webp");

export const FOOTER_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Studio", href: "/studio" },
] as const;
