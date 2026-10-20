import { ArrowLink } from "@/components/ui/arrow-link";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { PROPOSAL_CTA, PROPOSAL_HREF, SERVICES } from "@/constants/services";
import { cn } from "@/utils/cn";

/** Distance between the text block and the red box on each row (Figma). */
const ROW_GAPS = ["lg:gap-444", "lg:gap-184", "lg:gap-327"] as const;

/** Figma "Projetos" (1400px, BLACK GRAW): numbered services with deliverables. */
export function ServicesSection() {
  return (
    <section
      data-header-theme="light"
      className="relative flex flex-col gap-48 bg-black-graw px-16 py-96 text-white lg:block lg:h-1400 lg:p-0"
    >
      <SplitReveal
        as="h2"
        split="chars"
        className="text-display lg:absolute lg:top-252 lg:left-293 lg:w-580"
      >
        services
      </SplitReveal>

      <Reveal
        as="ol"
        stagger={0.15}
        className="flex flex-col gap-56 lg:absolute lg:top-436 lg:left-208 lg:w-1522 lg:gap-78"
      >
        {SERVICES.map((service, index) => (
          <li
            key={service.title}
            data-reveal
            className={cn(
              "flex flex-col gap-24 lg:flex-row lg:items-center",
              ROW_GAPS[index],
            )}
          >
            <div className="flex items-center gap-24 lg:gap-86">
              <span
                aria-hidden
                className="flex w-40 shrink-0 flex-col text-number lg:w-75"
              >
                {service.number.split("").map((digit, position) => (
                  <span key={position}>{digit}</span>
                ))}
              </span>
              <div className="flex flex-col gap-18 lg:h-126 lg:w-420">
                <h3 className="text-subheading">{service.title}</h3>
                <p className="text-desc font-light">{service.description}</p>
              </div>
            </div>

            <div className="flex gap-20.5 bg-red-graw pt-21 pr-23 pb-15 pl-22 text-tag font-medium uppercase lg:h-147 lg:w-495">
              {service.deliverables.map((column, columnIndex) => (
                <ul
                  key={columnIndex}
                  className="grid grid-rows-3 gap-y-6.75 lg:h-111"
                >
                  {column.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ))}
            </div>
          </li>
        ))}
      </Reveal>

      <ArrowLink
        href={PROPOSAL_HREF}
        className="self-start lg:absolute lg:top-1094 lg:left-1025"
      >
        {PROPOSAL_CTA}
      </ArrowLink>
    </section>
  );
}
