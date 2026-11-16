import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { getFaqs, getSite, getTestimonials } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About X AI Robotics | Our Mission & Vision",
  description:
    "Discover X AI Robotics, established in August 2025 with AI robot dog Chi Chi. Explore our mission, vision and commitment to India's robotics future.",
  keywords: [
    "About X AI Robotics",
    "Robotics Innovation India",
    "Robotics Technology",
    "Robotics Research",
  ],
  alternates: {
    canonical: "/about-us",
  },
};

export default async function Page() {
  const [site, faqs, testimonials] = await Promise.all([getSite(), getFaqs(), getTestimonials()]);
  return <AboutPage site={site} faqs={faqs} testimonials={testimonials} />;
}
