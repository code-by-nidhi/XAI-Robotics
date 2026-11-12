import type { Metadata, Viewport } from "next";
import { Michroma, Inter, JetBrains_Mono } from "next/font/google";
import { getSite } from "@/lib/cms";
import "./globals.css";

const display = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

/** Title, description and indexing come from CMS Settings → SEO. */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSite();
  return {
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    robots: seo.allowIndexing ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#050506",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
