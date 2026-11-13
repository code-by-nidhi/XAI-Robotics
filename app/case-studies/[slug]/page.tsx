import type { Metadata } from "next";
import { CaseStudyDetail } from "@/components/pages/DetailPages";
import { getCaseStudy } from "@/lib/cms";
import { detailMetadata, resolve } from "@/lib/detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return detailMetadata(await getCaseStudy((await params).slug), (i) => i.excerpt);
}

export default async function Page({ params }: Props) {
  const item = resolve(await getCaseStudy((await params).slug), "/case-studies");
  return <CaseStudyDetail item={item} />;
}
