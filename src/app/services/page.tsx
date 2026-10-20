import type { Metadata } from "next";
import { ServicesAccordionSection } from "@/components/sections/services-accordion-section";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <main id="conteudo">
      <ServicesAccordionSection />
    </main>
  );
}
