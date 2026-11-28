import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { ALL_LEARN_TOPICS } from "@/lib/learn/sidebar";

// Dynamic sitemap: every public route, built from the same static
// data the pages render from (sidebar topics), so it needs no
// database and works in `next build` on Vercel. Replaces the old
// static public/sitemap.xml (4 URLs, dead Fly host).
// /courses stays OUT: it is sign-in gated, Googlebot cannot reach
// it, and listing gated URLs is harmful — the hub stays listed as a
// static route below only because it is the section entry, and
// robots.ts disallows /courses so crawlers do not follow it.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const weekly = "weekly" as const;
  const monthly = "monthly" as const;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: weekly, priority: 1.0 },
    { url: `${SITE_URL}/courses`, lastModified, changeFrequency: weekly, priority: 0.8 },
    { url: `${SITE_URL}/editor`, lastModified, changeFrequency: monthly, priority: 0.7 },
    { url: `${SITE_URL}/modules`, lastModified, changeFrequency: monthly, priority: 0.7 },
    { url: `${SITE_URL}/logic-builder`, lastModified, changeFrequency: monthly, priority: 0.7 },
    { url: `${SITE_URL}/github`, lastModified, changeFrequency: monthly, priority: 0.5 },
  ];

  // 812 topics (268 tutorials + 544 reference entries).
  const lessonPages: MetadataRoute.Sitemap = ALL_LEARN_TOPICS.map((t) => ({
    url: `${SITE_URL}/learn/${t.slug}`,
    lastModified,
    changeFrequency: weekly,
    priority: 0.8,
  }));

  return [...staticPages, ...lessonPages];
}
