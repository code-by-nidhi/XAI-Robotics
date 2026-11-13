import type { Metadata } from "next";
import Contact from "@/components/Contact";
import { getSite } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Request a service, book a workshop or ask about the XAI Robotics programme.",
};

export default async function Page() {
  const site = await getSite();
  return (
    <main className="pg-contact">
      <Contact site={site} />
    </main>
  );
}
