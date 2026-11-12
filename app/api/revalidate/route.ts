import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CMS_TAG } from "@/lib/cms";

/**
 * Called by the CMS after every content save (its SITE_REVALIDATE_URL), with
 * the shared REVALIDATE_SECRET in `x-revalidate-secret`. Drops the cached CMS
 * reads so the next visitor sees the change.
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const sent = request.headers.get("x-revalidate-secret") ?? "";

  if (!expected) {
    return Response.json({ message: "REVALIDATE_SECRET is not set on the website." }, { status: 503 });
  }
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ message: "Invalid secret." }, { status: 401 });
  }

  revalidateTag(CMS_TAG);
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
