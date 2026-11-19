// Loading skeleton for the lessons route, matching the lesson article
// layout (heading + paragraphs + code block) — NOT the dashboard
// skeleton from the root loading.tsx, which shows a video area and
// progress cards and looked like the courses page while a lesson was
// loading (Maalik's order, 2026-11-19). The navbar + sidebar come from
// LearnLayout, so this only skeletons the article area.
export default function Loading() {
  return (
    <article className="space-y-6">
      <div className="h-10 w-3/4 animate-pulse rounded bg-neutral-800" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-800" />
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-neutral-800 bg-neutral-950" />
      <div className="h-8 w-1/2 animate-pulse rounded bg-neutral-800" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-800" />
      </div>
      <div className="h-32 animate-pulse rounded-xl border border-neutral-800 bg-neutral-950" />
    </article>
  );
}
