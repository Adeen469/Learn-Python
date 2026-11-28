import type { Metadata } from "next";
import type { ReactNode } from "react";
import { COURSE_CREATORS, playlistListId } from "@/lib/courses/data";
import { SITE_URL, SITE_NAME, metaDescription } from "@/lib/site";

// Static export (desktop app) needs every slug + collection listed up
// front: "one-shots" plus each playlist's list id. This layout only
// passes children through; the page stays a client component. Harmless
// for the Vercel build (these pages become SSG).
export function generateStaticParams() {
  return COURSE_CREATORS.flatMap((c) => [
    ...(c.oneShots.length ? [{ slug: c.slug, collection: "one-shots" }] : []),
    ...c.playlists.map((p) => ({ slug: c.slug, collection: playlistListId(p.url) })),
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; collection: string }>;
}): Promise<Metadata> {
  const { slug, collection } = await params;
  const creator = COURSE_CREATORS.find((c) => c.slug === slug);
  if (!creator) return {};
  const playlist = creator.playlists.find((p) => playlistListId(p.url) === collection);
  const collectionTitle =
    collection === "one-shots" ? `${creator.name} Python One-Shot Videos` : (playlist?.title ?? collection);
  const title = `${collectionTitle} — ${creator.name} | LP`;
  const description = metaDescription(
    `${collectionTitle}: free ${creator.language} Python videos on LP — ${creator.tagline} Watch and practise offline in the code editor.`,
  );
  const url = `${SITE_URL}/courses/${slug}/${collection}`;
  return {
    title,
    description,
    alternates: { canonical: `/courses/${slug}/${collection}` },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: "/lp-logo.png", width: 1535, height: 1535, alt: "Learn Python logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/lp-logo.png"],
    },
  };
}

export default function CollectionLayout({ children }: { children: ReactNode }) {
  return children;
}
