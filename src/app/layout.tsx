import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_CONFIG } from "@/constants/site";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={SITE_CONFIG.locale} className={inter.variable}>
      <body className="bg-white-graw font-sans text-black-graw antialiased">
        {children}
      </body>
    </html>
  );
}
