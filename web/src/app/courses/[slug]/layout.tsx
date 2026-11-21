import type { ReactNode } from "react";
import { COURSE_CREATORS } from "@/lib/courses/data";

// Static export (desktop app) needs every creator slug listed up front.
// This layout only passes children through; the page stays a client
// component. Harmless for the Vercel build (this page becomes SSG).
export function generateStaticParams() {
  return COURSE_CREATORS.map((c) => ({ slug: c.slug }));
}

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return children;
}
