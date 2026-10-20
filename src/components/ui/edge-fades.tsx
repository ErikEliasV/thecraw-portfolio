import { cn } from "@/utils/cn";

type EdgeFadesProps = {
  tone: "light" | "dark";
  /** Width (and optional height) utilities for each fade. */
  className?: string;
};

/** Figma side fades: background blur plus a translucent gradient on both edges. */
export function EdgeFades({ tone, className }: EdgeFadesProps) {
  const base = cn(
    "pointer-events-none absolute inset-y-0 z-10 to-transparent backdrop-blur-fade",
    tone === "light" ? "from-fade-light" : "from-fade-dark",
    className,
  );

  return (
    <>
      <div aria-hidden className={cn(base, "left-0 bg-linear-to-r")} />
      <div aria-hidden className={cn(base, "right-0 bg-linear-to-l")} />
    </>
  );
}
