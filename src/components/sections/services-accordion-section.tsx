import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { SERVICE_PANELS } from "@/constants/services";
import { cn } from "@/utils/cn";

const PANEL =
  "relative block min-h-0 min-w-0 flex-[1_1_0%] transition-[flex-grow] duration-700 ease-expo hover:grow-[6.3] focus-visible:grow-[6.3] motion-reduce:transition-none";

/**
 * Figma "Services" (1920×1080 + hover states): three panels; the one under
 * the cursor expands to about three quarters of the width.
 */
export function ServicesAccordionSection() {
  return (
    <section
      data-header-theme="dark"
      className="flex min-h-svh items-center justify-center bg-paper px-16 pt-120 pb-48 lg:px-0 lg:py-0"
    >
      <h1 className="sr-only">Services</h1>
      <Reveal className="flex h-[70svh] w-full flex-col lg:h-641 lg:w-1603 lg:translate-x-0.5 lg:translate-y-50.5 lg:flex-row">
        {SERVICE_PANELS.map((panel) =>
          panel.href ? (
            <Link
              key={panel.title}
              href={panel.href}
              aria-label={panel.title}
              className={cn(PANEL, panel.className)}
            />
          ) : (
            <div
              key={panel.title}
              aria-hidden
              className={cn(PANEL, panel.className)}
            />
          ),
        )}
      </Reveal>
    </section>
  );
}
