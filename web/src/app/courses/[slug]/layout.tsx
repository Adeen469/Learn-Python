import type { Metadata } from "next";
import type { ReactNode } from "react";
import { COURSE_CREATORS } from "@/lib/courses/data";
import { SITE_URL, SITE_NAME, metaDescription } from "@/lib/site";

// Static export (desktop app) needs every creator slug listed up front.
// This layout only passes children through; the page stays a client
// component. Harmless for the Vercel build (this page becomes SSG).
export function generateStaticParams() {
  return COURSE_CREATORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = COURSE_CREATORS.find((c) => c.slug === slug);
  if (!creator) return {};
  const title = `${creator.name} Python Course — Video Lessons & Offline Practice | LP`;
  const description = metaDescription(
    `${creator.tagline} Free ${creator.language} Python video course on LP — watch, practise in the editor, and save videos offline.`,
  );
  const url = `${SITE_URL}/courses/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/courses/${slug}` },
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

export default async function CreatorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = COURSE_CREATORS.find((c) => c.slug === slug);
  const jsonLd = creator
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: `${creator.name} Python Course`,
        description: creator.tagline,
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        isAccessibleForFree: true,
        inLanguage: creator.language === "Hindi" ? "hi" : "en",
        url: `${SITE_URL}/courses/${slug}`,
      }
    : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
