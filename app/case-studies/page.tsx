import type { Metadata } from "next";
import { CaseStudiesPage } from "@/components/pages/CollectionPages";
import { getCaseStudies } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Case studies",
  description: "How schools, colleges, partners and students built real robots with XAI Robotics.",
};

export default async function Page() {
  return <CaseStudiesPage items={await getCaseStudies(50)} />;
}
