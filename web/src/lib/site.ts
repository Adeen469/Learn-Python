// Single source of truth for the public site origin — every
// canonical, sitemap, robots and OpenGraph URL derives from this.
// (The old Fly hosts in layout.tsx and the static robots/sitemap
// files are dead; the live site is the Vercel domain below.)
export const SITE_URL = "https://learnpythonprogram.vercel.app";
export const SITE_NAME = "Learn Python";

// Meta descriptions read best at 140–155 chars: trim at the last
// word boundary so a cut never lands mid-word.
export function metaDescription(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
