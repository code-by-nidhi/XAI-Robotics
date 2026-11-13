import type { Metadata } from "next";
import { BlogsPage } from "@/components/pages/CollectionPages";
import { getPosts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Blog",
  description: "Build logs, tutorials, event recaps and news from the XAI Robotics lab.",
};

export default async function Page() {
  return <BlogsPage posts={await getPosts(50)} />;
}
