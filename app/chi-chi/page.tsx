import type { Metadata } from "next";
import ChiChiPage from "@/components/pages/ChiChiPage";
import { getFaqs, getSite } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Chi Chi: AI Robot Dog Prototype | X AI Robotics",
  description:
    "Discover Chi Chi, the 12-DOF AI quadruped robot dog that started the X AI Robotics journey in August 2025. Explore its mechanical design, ROS 2 autonomy, computer vision, and dynamic balance.",
  keywords: [
    "Chi Chi Robot Dog",
    "AI Quadruped Robot",
    "Robotics Prototype",
    "12 DOF Quadruped",
    "ROS 2 Robotics",
    "X AI Robotics Chi Chi",
  ],
  alternates: {
    canonical: "/chi-chi",
  },
};

export default async function Page() {
  const [site, faqs] = await Promise.all([getSite(), getFaqs()]);
  return <ChiChiPage site={site} faqs={faqs} />;
}
