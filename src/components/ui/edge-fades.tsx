import { cn } from "@/utils/cn";

type EdgeFadesProps = {
  tone: "light" | "dark";
  /** Width (and optional height) utilities for each fade. */
  className?: string;
};

/**
 * Progressive blur: each layer blurs twice as much as the one before but
 * covers a narrower band at the outer edge (opaque until `--from`, gone at
 * `--to`, measured inward), so the blur builds up toward the edge instead of
 * starting at a hard line.
 */
const BLUR_LAYERS = [
  "backdrop-blur-[calc(var(--blur-fade)/8)] [--from:50%] [--to:100%]",
  "backdrop-blur-[calc(var(--blur-fade)/4)] [--from:35%] [--to:75%]",
  "backdrop-blur-[calc(var(--blur-fade)/2)] [--from:20%] [--to:50%]",
  "backdrop-blur-fade [--from:0%] [--to:30%]",
] as const;

const SIDES = [
  { position: "left-0", inward: "[--inward:to_right]", tint: "bg-linear-to-r" },
  { position: "right-0", inward: "[--inward:to_left]", tint: "bg-linear-to-l" },
] as const;

/** Figma side fades: background blur plus a translucent gradient on both edges. */
export function EdgeFades({ tone, className }: EdgeFadesProps) {
  return SIDES.map((side) => (
    <div
      key={side.position}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10",
        side.position,
        side.inward,
        className,
      )}
    >
      {BLUR_LAYERS.map((layer) => (
        <div
          key={layer}
          className={cn(
            "absolute inset-0 [mask-image:linear-gradient(var(--inward),var(--color-black)_var(--from),transparent_var(--to))]",
            layer,
          )}
        />
      ))}
      <div
        className={cn(
          "absolute inset-0 to-transparent",
          tone === "light" ? "from-fade-light" : "from-fade-dark",
          side.tint,
        )}
      />
    </div>
  ));
}
