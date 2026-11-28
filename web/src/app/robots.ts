import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Dynamic robots: the single source of truth (the old static
// public/robots.txt pointed at a dead Fly sitemap and is deleted).
// Content pages are crawlable; app/session pages are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/auth/", "/settings", "/github", "/editor", "/offline", "/courses"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
