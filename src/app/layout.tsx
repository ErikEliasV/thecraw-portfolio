import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/layout/skip-link";
import { SITE_CONFIG } from "@/constants/site";
import { seagram, sfPro } from "@/lib/fonts";
import { SmoothScrollProvider } from "@/lib/smooth-scroll-provider";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE_CONFIG.locale}
      className={`${sfPro.variable} ${seagram.variable}`}
    >
      <body className="overflow-x-clip bg-white-graw font-sans text-black-graw antialiased">
        <SmoothScrollProvider>
          <SkipLink />
          <Header />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
