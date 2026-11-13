import type { Metadata, Viewport } from "next";
import { Michroma, Inter, JetBrains_Mono } from "next/font/google";
import { getSite } from "@/lib/cms";
import Shell from "@/components/Shell";
import "./globals.css";

const display = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

/** Title, description and indexing come from CMS Settings → SEO. */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSite();
  return {
    title: { default: seo.defaultTitle, template: `%s — ${seo.defaultTitle.split(" — ")[0]}` },
    description: seo.defaultDescription,
    robots: seo.allowIndexing ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Shell site={site}>{children}</Shell>
      </body>
    </html>
  );
}
