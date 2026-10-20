import { Reveal } from "@/components/ui/reveal";
import { STUDIO_PAGE } from "@/constants/pages";

/** Figma "Studio" body: purpose, pillars, foundations and media placeholders. */
export function StudioContentSection() {
  return (
    <section
      data-header-theme="dark"
      className="bg-paper px-16 py-64 text-black lg:px-0 lg:pt-91 lg:pb-134"
    >
      <div className="flex flex-col gap-48 lg:flex-row lg:gap-101 lg:pl-93">
        <Reveal className="flex flex-col gap-40 lg:w-703 lg:gap-51">
          {STUDIO_PAGE.sections.map((section) => (
            <div key={section.heading} data-reveal className="lg:min-h-193">
              <h2 className="text-heading font-light">{section.heading}</h2>
              <p className="text-body lg:h-100">{section.body}</p>
            </div>
          ))}
        </Reveal>
        <Reveal className="aspect-[938/874] w-full bg-placeholder lg:w-938">
          <span className="sr-only">Imagem em breve</span>
        </Reveal>
      </div>

      <Reveal className="mt-64 flex aspect-[1703/840] w-full items-center justify-center bg-placeholder lg:mt-134 lg:ml-109 lg:w-1703">
        <p className="text-nav leading-[1.03]">{STUDIO_PAGE.video}</p>
      </Reveal>
    </section>
  );
}
