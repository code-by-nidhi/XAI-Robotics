"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";
import type { PostCard } from "@/lib/cms";
import { Empty, PostCardView } from "../ui/Cards";

/** The latest posts from the CMS (Blog). */
export default function HomeNews({ posts, onNavigate }: { posts: PostCard[]; onNavigate: (t: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section className="section hm" id="blogs" ref={root}>
      <div className="container">
        <div className="hm-center">
          <span className="section-tag rv">From the lab</span>
          <h2 className="h2 rv">Articles &amp; resources</h2>
          <div className="rv">
            <a
              href="/blogs"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/blogs");
              }}
            >
              <span className="btn-dot" /> Browse all articles
            </a>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="hm-cards hm-cards-4">
            {posts.map((p) => (
              <PostCardView key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <Empty what="articles" />
        )}
      </div>
    </section>
  );
}
