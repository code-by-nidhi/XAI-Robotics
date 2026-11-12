import Site from "@/components/Site";
import { getFaqs, getSite } from "@/lib/cms";

export default async function Page() {
  const [site, faqs] = await Promise.all([getSite(), getFaqs()]);
  return <Site site={site} faqs={faqs} />;
}
