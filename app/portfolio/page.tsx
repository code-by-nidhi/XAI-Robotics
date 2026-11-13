import type { Metadata } from "next";
import { PortfolioPage } from "@/components/pages/CollectionPages";
import { getPortfolio } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Robots, labs and prototypes built by XAI Robotics engineers and students.",
};

export default async function Page() {
  return <PortfolioPage items={await getPortfolio({ pageSize: 50 })} />;
}
