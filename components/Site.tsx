"use client";

import HomeHero from "./home/HomeHero";
import HomeBeginning from "./home/HomeBeginning";
import HomeAbout from "./home/HomeAbout";
import TechMarquee from "./home/TechMarquee";
import HomeServices from "./home/HomeServices";
import HomeTechnologies from "./home/HomeTechnologies";
import HomeWhyChoose from "./home/HomeWhyChoose";
import HomeIndustries from "./home/HomeIndustries";
import HomeCampuses from "./home/HomeCampuses";
import HomeChronicle from "./home/HomeChronicle";
import HomeIndiaGlobal from "./home/HomeIndiaGlobal";
import HomePortfolio from "./home/HomePortfolio";
import HomeCaseStudy from "./home/HomeCaseStudy";
import HomeTestimonials from "./home/HomeTestimonials";
import HomeNews from "./home/HomeNews";
import HomeFinalCta from "./home/HomeFinalCta";
import Contact from "./Contact";
import { FaqBlock } from "./ui/Blocks";
import HomeClosing from "./home/HomeClosing";
import { useGo } from "./Shell";
import type { FaqItem, PortfolioCard, PostCard, SiteSettings, Testimonial } from "@/lib/cms";

/** The homepage containing all 12 sections from the official PDF specification. */
export default function Site({
  site,
  posts,
  featured,
  testimonials,
  faqs,
}: {
  site: SiteSettings;
  posts: PostCard[];
  featured: PortfolioCard | null;
  testimonials: Testimonial[];
  faqs: FaqItem[];
}) {
  const navigate = useGo();

  return (
    <main>
      {/* Section 1. Hero section */}
      <HomeHero onNavigate={navigate} />

      {/* Section 2. Our beginning — August 2025 */}
      <HomeBeginning onNavigate={navigate} />

      {/* Section 3. About Us */}
      <HomeAbout onNavigate={navigate} />

      {/* Visual Transition */}
      <TechMarquee />

      {/* Section 6. Our Robotics Services */}
      <HomeServices onNavigate={navigate} />

      {/* Section 7. Technologies and engineering capabilities */}
      <HomeTechnologies />

      {/* Section 8. Why choose X AI Robotics? */}
      <HomeWhyChoose />

      {/* Section 9. Industries and applications */}
      <HomeIndustries />

      {/* Section 10. Robotics workshops and institutional partnerships */}
      <HomeCampuses />

      {/* The Innovation Chronicle — Real-world visual gallery & proving grounds */}
      <HomeChronicle />

      {/* Section 11. Our connection with India and the world */}
      <HomeIndiaGlobal />

      {/* Featured Build & Case Study from CMS */}
      {featured && <HomePortfolio item={featured} onNavigate={navigate} />}
      <HomeCaseStudy onNavigate={navigate} />

      {/* Testimonials & News */}
      <HomeTestimonials items={testimonials} />
      <HomeNews posts={posts} onNavigate={navigate} />

      {/* Section 12. Final homepage CTA */}
      <HomeFinalCta onNavigate={navigate} />

      {/* FAQs & Contact */}
      <FaqBlock items={faqs} lede="Answers to what students, parents and partners ask us most." />
      <HomeClosing social={site.social} />
      <Contact site={site} />
    </main>
  );
}
