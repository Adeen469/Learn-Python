import type { ReactNode } from "react";
import { COURSE_CREATORS, playlistListId } from "@/lib/courses/data";

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

export default function CollectionLayout({ children }: { children: ReactNode }) {
  return children;
}
