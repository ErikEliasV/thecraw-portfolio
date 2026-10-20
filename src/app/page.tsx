import { Footer } from "@/components/layout/footer";
import { FeaturedProjectSection } from "@/components/sections/featured-project-section";
import { HeroSection } from "@/components/sections/hero-section";
import { LetsWorkSection } from "@/components/sections/lets-work-section";
import { ProjectsCarouselSection } from "@/components/sections/projects-carousel-section";
import { ServicesSection } from "@/components/sections/services-section";

export default function HomePage() {
  return (
    <>
      <main id="conteudo">
        <HeroSection />
        <FeaturedProjectSection />
        <ServicesSection />
        <LetsWorkSection />
        <ProjectsCarouselSection />
      </main>
      <Footer />
    </>
  );
}
