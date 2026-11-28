import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ALL_LEARN_TOPICS } from "@/lib/learn/sidebar";
import { getLearnReference, getLearnTutorial } from "@/lib/learn/index";
import { SITE_URL, SITE_NAME, metaDescription } from "@/lib/site";

// Static export (desktop app) needs every lesson slug listed up front.
// This layout only passes children through; the page stays a client
// component. Harmless for the Vercel build (these pages become SSG).
export function generateStaticParams() {
  return ALL_LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}

// The lesson body itself is still client-rendered (see page.tsx —
// localStorage progress, i18n, interactive runner), so crawlers get
// no lesson text from the HTML body yet. What they DO get, server-side:
// per-lesson title/description/OG tags from generateMetadata below,
// plus TechArticle JSON-LD in the layout. The JSON-LD uses the
// sidebar title only (sync lookup): awaiting the lesson chunk here
// pushed the script into the RSC streaming payload instead of the
// initial HTML, where non-JS crawlers never see it.
async function lessonFor(slug: string) {
  const tutorial = await getLearnTutorial(slug);
  if (tutorial) return { title: tutorial.title, description: tutorial.intro };
  const reference = await getLearnReference(slug);
  if (reference) return { title: reference.title, description: reference.description };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = ALL_LEARN_TOPICS.find((t) => t.slug === slug);
  const lesson = await lessonFor(slug);
  const title = lesson?.title ?? topic?.title ?? slug;
  const pageTitle = `${title} in Python — Interactive Lesson & Offline Practice | LP`;
  const description = metaDescription(
    lesson?.description ??
      `Learn ${title} in Python — free interactive lesson with examples you can run offline in the LP code editor.`,
  );
  const url = `${SITE_URL}/learn/${slug}`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: `/learn/${slug}` },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      images: [{ url: "/lp-logo.png", width: 1535, height: 1535, alt: "Learn Python logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: ["/lp-logo.png"],
    },
  };
}

export default async function LearnSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Title + description from the sidebar only — a SYNC lookup. The
  // rich per-lesson intro lives in the chunk files (dynamic import),
  // and awaiting that import here pushed this script into the RSC
  // streaming payload instead of the initial HTML, where crawlers
  // that don't run JS never see it. The rich text still reaches
  // crawlers through generateMetadata above (meta description + OG).
  const topic = ALL_LEARN_TOPICS.find((t) => t.slug === slug);
  const title = topic?.title ?? slug;
  const description = `Learn ${title} in Python — free interactive lesson with examples you can run offline in the LP code editor.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: `${title} in Python`,
        description,
        programmingLanguage: "Python",
        isAccessibleForFree: true,
        url: `${SITE_URL}/learn/${slug}`,
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Learn Python", item: `${SITE_URL}/learn/python-home` },
          { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/learn/${slug}` },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
