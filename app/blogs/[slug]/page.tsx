import type { Metadata } from "next";
import { PostDetail } from "@/components/pages/DetailPages";
import { getPost, getPosts } from "@/lib/cms";
import { detailMetadata, resolve } from "@/lib/detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return detailMetadata(await getPost((await params).slug), (p) => p.excerpt);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [result, latest] = await Promise.all([getPost(slug), getPosts(4)]);
  const post = resolve(result, "/blogs");
  return <PostDetail post={post} more={latest.filter((p) => p.slug !== post.slug).slice(0, 3)} />;
}
