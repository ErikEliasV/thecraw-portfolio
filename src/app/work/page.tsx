import type { Metadata } from "next";
import { WorkSection } from "@/components/sections/work-section";
import { WORK_PAGE } from "@/constants/pages";

export const metadata: Metadata = {
  title: WORK_PAGE.title,
};

export default function WorkPage() {
  return (
    <main id="conteudo">
      <WorkSection />
    </main>
  );
}
