import type { Metadata } from "next";
import ServicesPage from "@/components/pages/ServicesPage";
import { getFaqs, getSite, getTestimonials } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Robotics programme, R&D incubation, school and college workshops, robot shows, lab setups and custom robot builds.",
};

export default async function Page() {
  const [site, faqs, testimonials] = await Promise.all([getSite(), getFaqs(), getTestimonials()]);
  return <ServicesPage site={site} faqs={faqs} testimonials={testimonials} />;
}
