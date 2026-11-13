"use client";

import HomeHero from "./home/HomeHero";
import HomeFeatures from "./home/HomeFeatures";
import HomeAbout from "./home/HomeAbout";
import TechMarquee from "./home/TechMarquee";
import HomeCaseStudy from "./home/HomeCaseStudy";
import HomeCta from "./home/HomeCta";
import HomePortfolio from "./home/HomePortfolio";
import HomeNews from "./home/HomeNews";
import HomeTestimonials from "./home/HomeTestimonials";
import HomeClosing from "./home/HomeClosing";
import Contact from "./Contact";
import { FaqBlock } from "./ui/Blocks";
import { useGo } from "./Shell";
import type { FaqItem, PortfolioCard, PostCard, SiteSettings, Testimonial } from "@/lib/cms";

/** The homepage. Blog posts, the featured build, testimonials and FAQs come from the CMS. */
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
      <HomeHero onNavigate={navigate} />
      <HomeAbout onNavigate={navigate} />
      <TechMarquee />
      <HomeFeatures onNavigate={navigate} />
      <HomeCaseStudy onNavigate={navigate} />
      <HomePortfolio item={featured} onNavigate={navigate} />
      <HomeCta onNavigate={navigate} />
      <HomeTestimonials items={testimonials} />
      <HomeNews posts={posts} onNavigate={navigate} />
      <FaqBlock items={faqs} lede="Answers to what students, parents and partners ask us most." />
      <HomeClosing social={site.social} />
      <Contact site={site} />
    </main>
  );
}
