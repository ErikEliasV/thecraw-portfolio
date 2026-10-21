import { SplitReveal } from "@/components/ui/split-reveal";
import { HERO_DITHER } from "@/constants/dither";
import { DitherImage } from "@/features/dither-image";

/**
 * Figma "Desktop - 1": dithered knight with the blackletter headline. The
 * first screen matches the frame; the image goes on for 30% more below it.
 */
export function HeroSection() {
  return (
    <section
      data-header-theme="light"
      className="relative h-[130svh] overflow-hidden bg-red-graw"
    >
      <DitherImage {...HERO_DITHER} animation="intro" />
      <SplitReveal
        as="h1"
        split="chars"
        trigger="load"
        delay={0.35}
        className="absolute top-[60svh] left-1/2 -translate-x-1/2 font-blackletter text-hero whitespace-nowrap text-white-graw"
      >
        Building for victory
      </SplitReveal>
    </section>
  );
}
