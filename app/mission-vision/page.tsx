import type { Metadata } from "next";
import MissionVisionPage from "@/components/pages/MissionVisionPage";
import { getFaqs, getSite } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Mission & Vision | X AI Robotics",
  description:
    "Explore the 7 foundational mission pillars and strategic vision of X AI Robotics. Empowering India's robotics ecosystem through hands-on education, hardware innovation, and embodied AI.",
  keywords: [
    "X AI Robotics Mission",
    "Robotics Vision India",
    "Robotics Education",
    "Quadruped Robotics",
    "Industrial Automation",
    "techcadd ecosystem",
  ],
  alternates: {
    canonical: "/mission-vision",
  },
};

export default async function Page() {
  const [site, faqs] = await Promise.all([getSite(), getFaqs()]);
  return <MissionVisionPage site={site} faqs={faqs} />;
}
