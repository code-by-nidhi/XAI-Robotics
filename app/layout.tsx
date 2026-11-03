import type { Metadata, Viewport } from "next";
import { Michroma, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "XAI Robotics — Machines that perceive, reason and move",
  description:
    "XAI Robotics engineers autonomous humanoids, manipulators, quadrupeds and aerial systems powered by embodied intelligence.",
};

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
