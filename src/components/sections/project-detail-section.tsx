import { GalleryImage } from "@/components/ui/gallery-image";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { LOREM_LONG, PROJECT_PAGE } from "@/constants/pages";
import type { Project } from "@/types/project";

type ProjectDetailSectionProps = {
  project: Project;
};

const WIDE = "aspect-[1346/747]";

/** Figma "Project Open" (1440 frame): hero, intro, gallery, story and credits. */
export function ProjectDetailSection({ project }: ProjectDetailSectionProps) {
  return (
    <>
      <section data-header-theme="light" className="pb-20">
        <div className="relative aspect-[1440/799] w-full bg-placeholder">
          <ParallaxImage
            src={project.cover}
            alt=""
            priority
            imageClassName="object-[50%_39.5%]"
          />
        </div>
      </section>

      <section
        data-header-theme="dark"
        className="flex flex-col items-center gap-64 pt-44 text-black lg:gap-92"
      >
        <div className="flex w-full flex-col gap-32 px-16 lg:px-52">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
            <SplitReveal
              as="h1"
              split="chars"
              trigger="load"
              className="text-title"
            >
              {project.title}
            </SplitReveal>
            <p className="text-meta text-orange lg:w-99">{project.category}</p>
          </div>
          <Reveal>
            <p className="text-body lg:w-1037">{LOREM_LONG}</p>
          </Reveal>
        </div>

        <div className="flex w-full flex-col gap-64 px-6 lg:w-1366 lg:gap-92 lg:px-0">
          <div className="flex flex-col gap-9">
            <GalleryImage src={project.cover} aspectClassName={WIDE} />
            <div className="flex flex-col gap-30 lg:flex-row lg:items-start">
              <GalleryImage
                src={project.cover}
                aspectClassName="aspect-[781/747]"
                imageClassName="object-center"
                className="lg:w-801"
              />
              <Reveal className="flex flex-col gap-14 px-10 lg:w-450 lg:px-0">
                <h2 className="text-heading tracking-tight">
                  {PROJECT_PAGE.solution}
                </h2>
                <p className="text-body">{LOREM_LONG}</p>
              </Reveal>
            </div>
            {[0, 1, 2].map((index) => (
              <GalleryImage
                key={index}
                src={project.cover}
                aspectClassName={WIDE}
              />
            ))}
          </div>

          <Reveal className="flex flex-col gap-30 px-10 lg:flex-row lg:items-start lg:self-center lg:px-0">
            <div data-reveal className="flex flex-col gap-6 lg:w-797">
              <h2 className="text-heading tracking-tight">
                {PROJECT_PAGE.process}
              </h2>
              <p className="text-body">{LOREM_LONG}</p>
            </div>
            <div data-reveal className="flex flex-col gap-6 lg:w-458">
              <h2 className="text-heading tracking-tight">
                {PROJECT_PAGE.results}
              </h2>
              <p className="text-body">{PROJECT_PAGE.resultsBody}</p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-41">
            {[0, 1, 2].map((index) => (
              <GalleryImage
                key={index}
                src={project.cover}
                aspectClassName={WIDE}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-31">
          <GalleryImage
            src={project.cover}
            aspectClassName="aspect-[1420/799]"
            className="w-full"
          />
          <div className="relative grid w-full px-16 lg:w-1320 lg:px-0">
            <Reveal className="col-start-1 row-start-1 grid grid-cols-2 gap-x-24 lg:flex lg:w-1034 lg:gap-90 lg:p-10">
              {PROJECT_PAGE.credits.map((column, columnIndex) => (
                <dl
                  key={columnIndex}
                  data-reveal
                  className={
                    columnIndex === 0
                      ? "flex flex-col gap-46 lg:w-428"
                      : "flex flex-col gap-46 lg:w-496"
                  }
                >
                  {column.map((credit) => (
                    <div key={credit.label} className="flex flex-col gap-6">
                      <dt className="text-heading tracking-tight">
                        {credit.label}
                      </dt>
                      <dd className="text-credit">{credit.value}</dd>
                    </div>
                  ))}
                </dl>
              ))}
            </Reveal>
            <SplitReveal
              split="chars"
              className="pointer-events-none col-start-1 row-start-1 mt-auto justify-self-end text-end text-orange lg:mt-55 lg:ml-714 lg:h-334 lg:w-606 lg:justify-self-start"
            >
              {PROJECT_PAGE.end}
            </SplitReveal>
          </div>
        </div>
      </section>
    </>
  );
}
