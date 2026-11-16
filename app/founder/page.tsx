import type { Metadata } from "next";
import FounderPage from "@/components/pages/FounderPage";
import { getFaqs, getSite } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Founder & Leadership | X AI Robotics",
  description:
    "Discover the vision and leadership behind X AI Robotics, established in August 2025 within the techcadd ecosystem. Dedicated to practical robotics, hands-on engineering, and empowering India's technological future.",
  keywords: [
    "X AI Robotics Founder",
    "Robotics Leadership India",
    "techcadd ecosystem",
    "Robotics Innovation",
    "Chi Chi AI Dog",
    "Hands-on Engineering",
  ],
  alternates: {
    canonical: "/founder",
  },
};

export default async function Page() {
  const [site, faqs] = await Promise.all([getSite(), getFaqs()]);
  return <FounderPage site={site} faqs={faqs} />;
}
