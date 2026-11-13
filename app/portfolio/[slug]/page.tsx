import type { Metadata } from "next";
import { PortfolioDetail } from "@/components/pages/DetailPages";
import { getPortfolioItem } from "@/lib/cms";
import { detailMetadata, resolve } from "@/lib/detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return detailMetadata(await getPortfolioItem((await params).slug), (i) => i.summary);
}

export default async function Page({ params }: Props) {
  const item = resolve(await getPortfolioItem((await params).slug), "/portfolio");
  return <PortfolioDetail item={item} />;
}
