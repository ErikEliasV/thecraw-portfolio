import { Footer } from "@/components/layout/footer";
import { SITE_CONFIG } from "@/constants/site";

export default function HomePage() {
  return (
    <>
      <main id="conteudo">
        <h1 className="sr-only">{SITE_CONFIG.name}</h1>
      </main>
      <Footer />
    </>
  );
}
