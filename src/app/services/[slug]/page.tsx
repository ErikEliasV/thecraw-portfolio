import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSection } from "@/components/sections/service-detail-section";
import { SERVICE_DETAILS } from "@/constants/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_DETAILS.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICE_DETAILS.find((item) => item.slug === slug);
  return { title: service?.title };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = SERVICE_DETAILS.find((item) => item.slug === slug);
  if (!service) notFound();

  return (
    <main id="conteudo">
      <ServiceDetailSection service={service} />
    </main>
  );
}
