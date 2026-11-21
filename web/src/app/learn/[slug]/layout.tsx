import type { ReactNode } from "react";
import { ALL_LEARN_TOPICS } from "@/lib/learn/sidebar";

// Static export (desktop app) needs every lesson slug listed up front.
// This layout only passes children through; the page stays a client
// component. Harmless for the Vercel build (these pages become SSG).
export function generateStaticParams() {
  return ALL_LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}

export default function LearnSlugLayout({ children }: { children: ReactNode }) {
  return children;
}
