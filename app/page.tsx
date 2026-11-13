import Site from "@/components/Site";
import { getFaqs, getPortfolio, getPosts, getSite, getTestimonials } from "@/lib/cms";

export default async function Page() {
  const [site, posts, portfolio, testimonials, faqs] = await Promise.all([
    getSite(),
    getPosts(4),
    getPortfolio({ pageSize: 12 }),
    getTestimonials(),
    getFaqs(),
  ]);
  // The first featured project, or the first project when none is featured.
  const featured = portfolio.find((p) => p.featured) ?? portfolio[0] ?? null;
  return <Site site={site} posts={posts} featured={featured} testimonials={testimonials} faqs={faqs} />;
}
