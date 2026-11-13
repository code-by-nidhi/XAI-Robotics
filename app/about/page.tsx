import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { getFaqs, getSite, getTestimonials } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About us",
  description: "XAI Robotics is a hands-on robotics lab: our mission, values, team and labs.",
};

export default async function Page() {
  const [site, faqs, testimonials] = await Promise.all([getSite(), getFaqs(), getTestimonials()]);
  return <AboutPage site={site} faqs={faqs} testimonials={testimonials} />;
}
